"use client"

import { useEffect, useRef, useState } from "react"

/** Informações sobre cada parte gravada (arquivo independente). */
export type PartInfo = {
  index: number
  startedAt: number
  durationMs: number
  mimeType: string
}

export type UseAudioRecorderOptions = {
  mimeType?: string
  timeslice?: number
  onChunk?: (chunk: Blob) => Promise<void> | void
  onStop?: (fullBlob: Blob) => Promise<void> | void

  mode?: "dual" | "single"
  partDurationMs?: number
  overlapMs?: number

  onPart?: (blob: Blob, info: PartInfo) => Promise<void> | void
}

export type UseAudioRecorderReturn = {
  /** Solicita permissão do microfone (exibe prompt) e atualiza `permission`. */
  requestPermission: () => Promise<boolean>

  /** Inicia a sessão (só inicia se a permissão e o stream estiverem OK). */
  start: () => Promise<void>

  stop: () => void
  pause: () => void
  resume: () => void
  cutNow: () => Promise<void>

  isRecording: boolean
  isPaused: boolean
  isCutting: boolean
  recordingTime: number
  permission: PermissionState | null
  canRecord: boolean
  error: string | null
  supportedMimeType?: string
}

type MediaRecorderErrorEventSafe = Event & { error?: DOMException }

export function useAudioRecorder(opts?: UseAudioRecorderOptions): UseAudioRecorderReturn {
  // ---- opções
  const desiredMime = opts?.mimeType ?? "audio/webm;codecs=opus"
  const timeslice = Math.max(250, opts?.timeslice ?? 1500)
  const mode = opts?.mode ?? "dual"
  const partDurationMs = Math.max(1000, opts?.partDurationMs ?? 10_000)
  const overlapMs = Math.max(200, Math.min(opts?.overlapMs ?? 700, Math.floor(partDurationMs / 2)))

  // ---- refs globais
  const streamRef = useRef<MediaStream | null>(null)
  const recARef = useRef<MediaRecorder | null>(null)
  const recBRef = useRef<MediaRecorder | null>(null)
  type Label = "A" | "B"
  const currentLabelRef = useRef<Label | null>(null)

  // estado UI
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCutting, setIsCutting] = useState(false)

  const canRecord = permission === "granted"

  // timers
  const sessionTimerRef = useRef<number | null>(null)
  const cutTickRef = useRef<number | null>(null)
  const cuttingNowRef = useRef(false)
  const finalStopRef = useRef(false)

  // fila de backpressure
  const queueRef = useRef<Blob[]>([])
  const processingRef = useRef(false)

  // buffers
  const fullChunksRef = useRef<Blob[] | null>(opts?.onStop ? [] : null)
  const partChunksRef = useRef<{ A: Blob[]; B: Blob[] }>({ A: [], B: [] })
  const partStartedAtRef = useRef<{ A: number | null; B: number | null }>({ A: null, B: null })
  const partIndexRef = useRef(0)

  // mime suportado
  const supportedMimeRef = useRef<string | undefined>(undefined)

  // ---- helpers
  function pickSupportedMimeType(): string | undefined {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return undefined
    if (supportedMimeRef.current) return supportedMimeRef.current
    const candidates = [
      desiredMime,
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ] as const
    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c)) {
          supportedMimeRef.current = c
          return c
        }
      } catch {}
    }
    supportedMimeRef.current = undefined
    return undefined
  }

  async function probePermission(): Promise<PermissionState | null> {
    try {
      const res: any = await navigator?.permissions?.query?.({ name: "microphone" as any })
      if (res && "state" in res) {
        setPermission(res.state as PermissionState)
        return res.state as PermissionState
      }
    } catch {}
    return null
  }

  async function requestPermission(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Ambiente sem suporte a getUserMedia.")
      setPermission(null)
      return false
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      // encerra tracks — a sessão real será aberta no start()
      s.getTracks().forEach((t) => t.stop())
      setPermission("granted")
      setError(null)
      return true
    } catch (e: any) {
      setPermission("denied")
      setError(e?.message || "Permissão do microfone negada.")
      return false
    }
  }

  function startSessionTimerOnce() {
    if (sessionTimerRef.current) return
    sessionTimerRef.current = window.setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }
  function clearSessionTimer() {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current)
      sessionTimerRef.current = null
    }
  }
  function clearCutTick() {
    if (cutTickRef.current) {
      clearTimeout(cutTickRef.current)
      cutTickRef.current = null
    }
  }

  async function processQueue() {
    if (processingRef.current) return
    processingRef.current = true
    try {
      while (queueRef.current.length > 0) {
        const next = queueRef.current.shift()!
        try {
          await opts?.onChunk?.(next)
        } catch (e) {
          console.error("onChunk falhou:", e)
        }
      }
    } finally {
      processingRef.current = false
    }
  }

  async function drainQueue() {
    while (processingRef.current) {
      await new Promise((r) => setTimeout(r, 25))
    }
    if (queueRef.current.length > 0) {
      await processQueue()
    }
  }

  async function ensureStream(): Promise<MediaStream> {
    // se já existe stream vivo, reutiliza
    if (streamRef.current && streamRef.current.getAudioTracks().some((t) => t.readyState === "live")) {
      return streamRef.current
    }
    // tenta obter stream
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = s
      setPermission("granted")
      setError(null)
      return s
    } catch (e: any) {
      // não inicia nada se falhar
      const state = (await probePermission()) ?? null
      if (state) setPermission(state)
      setError(e?.message || "Permissão do microfone negada.")
      throw e
    }
  }

  function createRecorder(label: Label, stream: MediaStream): MediaRecorder {
    const supported = pickSupportedMimeType()
    const options: MediaRecorderOptions = supported ? { mimeType: supported } : {}
    let rec: MediaRecorder
    try {
      rec = new MediaRecorder(stream, options)
    } catch {
      rec = new MediaRecorder(stream)
    }

    rec.ondataavailable = (ev: BlobEvent) => {
      const blob = ev.data
      if (!blob || blob.size === 0) return
      if (opts?.onChunk) {
        queueRef.current.push(blob)
        void processQueue()
      }
      if (fullChunksRef.current) fullChunksRef.current.push(blob)
      partChunksRef.current[label].push(blob)
    }

    rec.onstart = () => {
      // NÃO zere o contador aqui.
      partStartedAtRef.current[label] = Date.now()
    }

    rec.onpause = () => setIsPaused(true)
    rec.onresume = () => setIsPaused(false)

    rec.onerror = (ev: MediaRecorderErrorEventSafe) => {
      const msg = ev.error?.message || "Erro desconhecido no MediaRecorder."
      setError(msg)
    }

    rec.onstop = async () => {
      const chunks = partChunksRef.current[label]
      if (chunks.length > 0) {
        const mime = chunks[0]?.type || rec.mimeType || supportedMimeRef.current || "audio/webm"
        const blob = new Blob(chunks, { type: mime })
        const startedAt = partStartedAtRef.current[label] ?? Date.now()
        const durationMs = Date.now() - startedAt
        const idx = ++partIndexRef.current

        partChunksRef.current[label] = []
        partStartedAtRef.current[label] = null

        try {
          await opts?.onPart?.(blob, { index: idx, startedAt, durationMs, mimeType: mime })
        } catch (e) {
          console.error("onPart falhou:", e)
        }
      }

      try {
        await drainQueue()
      } catch (e) {
        console.error("Falha ao drenar fila:", e)
      }

      const bothInactive =
        (!recARef.current || recARef.current.state === "inactive") &&
        (!recBRef.current || recBRef.current.state === "inactive")

      if (bothInactive && finalStopRef.current) {
        clearSessionTimer()
        setIsRecording(false)
        setIsPaused(false)

        if (opts?.onStop && fullChunksRef.current?.length) {
          const finalType = rec.mimeType || supportedMimeRef.current || "audio/webm"
          const fullBlob = new Blob(fullChunksRef.current, { type: finalType })
          fullChunksRef.current = []
          try {
            await opts.onStop(fullBlob)
          } catch (e) {
            console.error("onStop falhou:", e)
          }
        }

        try {
          const s = streamRef.current
          s?.getTracks().forEach((t) => t.stop())
        } catch {}
      }
    }

    return rec
  }

  // ---- dual
  async function startDual(stream: MediaStream) {
    // zera buffers
    partChunksRef.current = { A: [], B: [] }
    partStartedAtRef.current = { A: null, B: null }
    partIndexRef.current = 0
    queueRef.current = []
    fullChunksRef.current = opts?.onStop ? [] : null
    setError(null)

    // inicia A
    recARef.current = createRecorder("A", stream)
    recARef.current.start(timeslice)
    currentLabelRef.current = "A"

    const lead = Math.max(0, partDurationMs - overlapMs)

    const schedule = () => {
      clearCutTick()
      cutTickRef.current = window.setTimeout(async () => {
        if (cuttingNowRef.current) return
        await tickDual(stream, lead)
        schedule()
      }, lead)
    }

    schedule()
  }

  async function tickDual(stream: MediaStream, lead: number) {
    if (cuttingNowRef.current) return
    const current = currentLabelRef.current
    const next: Label = current === "A" ? "B" : "A"

    const nextRef = next === "A" ? recARef : recBRef
    if (!nextRef.current || nextRef.current.state === "inactive") {
      nextRef.current = createRecorder(next, stream)
      nextRef.current.start(timeslice)
    }
    currentLabelRef.current = next

    setTimeout(() => {
      const prevRef = current === "A" ? recARef : recBRef
      if (prevRef.current && prevRef.current.state === "recording") {
        try {
          prevRef.current.requestData()
        } catch {}
        prevRef.current.stop()
      }
    }, overlapMs)
  }

  // ---- single
  async function startSingle(stream: MediaStream) {
    partChunksRef.current = { A: [], B: [] }
    partStartedAtRef.current = { A: null, B: null }
    partIndexRef.current = 0
    queueRef.current = []
    fullChunksRef.current = opts?.onStop ? [] : null
    setError(null)

    recARef.current = createRecorder("A", stream)
    recARef.current.start(timeslice)
    currentLabelRef.current = "A"

    clearCutTick()
    cutTickRef.current = window.setTimeout(async function loop() {
      await cutNow()
      cutTickRef.current = window.setTimeout(loop, partDurationMs)
    }, partDurationMs)
  }

  // ---- API
  async function start() {
    setError(null)
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setError("Ambiente sem suporte a getUserMedia.")
      setPermission(null)
      return
    }

    // não inicie nada se estiver gravando
    if (isRecording) return

    // respeita permissão: se explicitamente negada, não começa
    const perm = await probePermission()
    if (perm === "denied") {
      setError("Permissão do microfone negada.")
      return
    }

    // tenta obter o stream (só após sucesso a sessão/contador começam)
    let stream: MediaStream
    try {
      stream = await ensureStream()
    } catch {
      // ensureStream já setou error/permission
      return
    }

    // OK: inicia sessão agora
    finalStopRef.current = false
    setRecordingTime(0)
    startSessionTimerOnce()
    setIsRecording(true)
    setIsPaused(false)

    if (mode === "dual") await startDual(stream)
    else await startSingle(stream)
  }

  function pause() {
    if (recARef.current && recARef.current.state === "recording") recARef.current.pause()
    if (recBRef.current && recBRef.current.state === "recording") recBRef.current.pause()
  }

  function resume() {
    if (recARef.current && recARef.current.state === "paused") recARef.current.resume()
    if (recBRef.current && recBRef.current.state === "paused") recBRef.current.resume()
  }

  function stop() {
    finalStopRef.current = true
    clearCutTick()

    const stopRec = (mr: MediaRecorder | null) => {
      if (!mr) return
      try {
        if (mr.state === "recording") {
          try { mr.requestData() } catch {}
          mr.stop()
        } else if (mr.state !== "inactive") {
          mr.stop()
        }
      } catch {}
    }

    stopRec(recARef.current)
    stopRec(recBRef.current)
    // o timer da sessão é parado no onstop quando ambos ficam inativos
  }

  async function cutNow() {
    if (cuttingNowRef.current || !isRecording) return
    cuttingNowRef.current = true
    setIsCutting(true)
    try {
      if (mode === "dual") {
        clearCutTick()
        const stream = await ensureStream()
        const lead = Math.max(0, partDurationMs - overlapMs)
        await tickDual(stream, lead)
        // reagenda
        cutTickRef.current = window.setTimeout(async function loop() {
          await tickDual(stream, lead)
          cutTickRef.current = window.setTimeout(loop, lead)
        }, lead)
      } else {
        const stream = await ensureStream()
        const mr = recARef.current
        if (mr && mr.state === "recording") {
          try { mr.requestData() } catch {}
          mr.stop()
        }
        await new Promise((r) => setTimeout(r, Math.max(100, overlapMs)))
        recARef.current = createRecorder("A", stream)
        recARef.current.start(timeslice)

        clearCutTick()
        cutTickRef.current = window.setTimeout(async function loop() {
          await cutNow()
          cutTickRef.current = window.setTimeout(loop, partDurationMs)
        }, partDurationMs)
      }
    } finally {
      cuttingNowRef.current = false
      setIsCutting(false)
    }
  }

  useEffect(() => {
    // tenta ler o estado de permissão na montagem (se suportado)
    void probePermission()
    return () => {
      try { stop() } catch {}
      clearCutTick()
      clearSessionTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    requestPermission,
    start,
    stop,
    pause,
    resume,
    cutNow,
    isRecording,
    isPaused,
    isCutting,
    recordingTime,
    permission,
    canRecord,
    error,
    supportedMimeType: supportedMimeRef.current,
  }
}
