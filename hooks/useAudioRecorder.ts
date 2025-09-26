// hooks/useAudioRecorder.tsx
"use client"

import { useRef, useState } from "react"

export type UseAudioRecorderOptions = {
  mimeType?: string
  timeslice?: number
  onChunk?: (chunk: Blob) => Promise<void> | void
  onStop?: (fullBlob: Blob) => Promise<void> | void
}

export type UseAudioRecorderReturn = {
  start: () => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  permission: PermissionState | null
  error: string | null
}

type MediaRecorderErrorEventSafe = Event & { error?: DOMException }

export function useAudioRecorder(opts?: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const {
    mimeType: desiredMime = "audio/webm;codecs=opus",
    timeslice = 2000,
    onChunk,
    onStop,
  } = opts ?? {}

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<number | null>(null)

  // Fila para backpressure do onChunk
  const queueRef = useRef<Blob[]>([])
  const isProcessingRef = useRef(false)

  // Acumular somente se quiser blob final no onStop
  const fullChunksRef = useRef<Blob[] | null>(onStop ? [] : null)

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startTimer() {
    clearTimer()
    intervalRef.current = window.setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }

  function pickSupportedMimeType(): string | undefined {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return undefined

    const candidates = [
      desiredMime,
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ].filter(Boolean) as string[]

    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c)) return c
      } catch {}
    }
    return undefined
  }

  async function checkPermission(): Promise<PermissionState | null> {
    try {
      // permissions pode não existir em todos navegadores
      const res: any = await navigator?.permissions?.query?.({ name: "microphone" })
      if (res && "state" in res) {
        setPermission(res.state as PermissionState)
        return res.state as PermissionState
      }
    } catch {}
    return null
  }

  async function start() {
    setError(null)

    // ✅ evita reentrância
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      return
    }

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setError("Ambiente sem suporte a getUserMedia.")
      return
    }

    await checkPermission()

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e: any) {
      setError(e?.message || "Falha ao obter permissão do microfone.")
      return
    }
    streamRef.current = stream

    const supportedMime = pickSupportedMimeType()
    const options: MediaRecorderOptions = supportedMime ? { mimeType: supportedMime } : {}

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, options)
    } catch {
      try {
        recorder = new MediaRecorder(stream) // fallback sem options
      } catch (err: any) {
        setError(err?.message || "Falha ao inicializar MediaRecorder.")
        throw err
      }
    }

    // ✅ zera buffers/estado para nova sessão
    queueRef.current = []
    isProcessingRef.current = false
    fullChunksRef.current = onStop ? [] : null
    setRecordingTime(0)

    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (ev: BlobEvent) => {
      const blob = ev.data
      if (!blob || blob.size === 0) return

      if (onChunk) {
        queueRef.current.push(blob)
        void processQueue()
      }
      if (fullChunksRef.current) {
        fullChunksRef.current.push(blob)
      }
    }

    recorder.onstart = () => {
      setIsRecording(true)
      setIsPaused(false)
      startTimer()
    }

    recorder.onpause = () => {
      setIsPaused(true)
      // (opcional) pause no cronômetro:
      clearTimer()
    }
    recorder.onresume = () => {
      setIsPaused(false)
      // (opcional) retoma cronômetro:
      startTimer()
    }

    // ✅ tipado + fallback seguro
    recorder.onerror = (ev: MediaRecorderErrorEventSafe) => {
      const msg = ev.error?.message || "Erro desconhecido no MediaRecorder."
      setError(msg)
    }

    recorder.onstop = async () => {
      clearTimer()
      setIsRecording(false)
      setIsPaused(false)

      try {
        stream.getTracks().forEach((t) => t.stop())
      } catch {}

      // Blob final (se solicitado)
      if (onStop && fullChunksRef.current && fullChunksRef.current.length > 0) {
        const finalType = recorder.mimeType || supportedMime || "audio/webm"
        const fullBlob = new Blob(fullChunksRef.current, { type: finalType })
        fullChunksRef.current = [] // limpa para próxima
        try {
          await onStop(fullBlob)
        } catch (e) {
          console.error("onStop handler falhou:", e)
        }
      }

      // Garante que a fila foi drenada
      try {
        await drainQueue()
      } catch (e) {
        console.error("Falha ao drenar fila ao parar:", e)
      }
    }

    // Inicia com timeslice (em ms)
    recorder.start(Math.max(250, timeslice))
  }

  function pause() {
    const mr = mediaRecorderRef.current
    if (mr && mr.state === "recording") mr.pause()
  }

  function resume() {
    const mr = mediaRecorderRef.current
    if (mr && mr.state === "paused") mr.resume()
  }

  function stop() {
    const mr = mediaRecorderRef.current
    if (!mr) return
    if (mr.state === "recording") {
      // ✅ força emissão do último chunk antes de parar
      try { mr.requestData() } catch {}
    }
    if (mr.state !== "inactive") mr.stop()
  }

  async function processQueue() {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    try {
      while (queueRef.current.length > 0) {
        const next = queueRef.current.shift()!
        try {
          await onChunk?.(next)
        } catch (e) {
          console.error("onChunk falhou:", e)
          // opcional: retry aqui
        }
      }
    } finally {
      isProcessingRef.current = false
    }
  }

  async function drainQueue() {
    if (isProcessingRef.current) {
      while (isProcessingRef.current) {
        await new Promise((r) => setTimeout(r, 50))
      }
    }
    if (queueRef.current.length > 0) {
      await processQueue()
    }
  }

  return {
    start,
    stop,
    pause,
    resume,
    isRecording,
    isPaused,
    recordingTime,
    permission,
    error,
  }
}
