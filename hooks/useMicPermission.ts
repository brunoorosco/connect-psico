import { useCallback, useEffect, useRef, useState } from "react"

export type MicPermission = "granted" | "denied" | "prompt" | "unsupported" | "error"

type UseMicPermission = {
  status: MicPermission
  requesting: boolean
  lastError?: string
  ensureMicAccess: (opts?: MediaStreamConstraints) => Promise<MediaStream | null>
  stopCurrentStream: () => void
}

export function useMicPermission(): UseMicPermission {
  const [status, setStatus] = useState<MicPermission>("prompt")
  const [requesting, setRequesting] = useState(false)
  const [lastError, setLastError] = useState<string>()
  const streamRef = useRef<MediaStream | null>(null)

  // Checa suporte e status inicial (quando possível)
  useEffect(() => {
    let cancelled = false

    async function check() {
      if (typeof navigator === "undefined") return
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported")
        return
      }

      // Nem todo navegador expõe Permissions API pro mic (ex.: Safari)
      const hasPermissionsAPI = !!(navigator as any).permissions?.query

      if (!hasPermissionsAPI) {
        // Fallback: tentaremos só quando o usuário clicar para permitir
        setStatus("prompt")
        return
      }

      try {
        // TS não tem 'microphone' diretamente tipado
        const res = await (navigator as any).permissions.query({ name: "microphone" as PermissionName })
        if (cancelled) return

        const st = res.state as PermissionState // "granted" | "denied" | "prompt"
        setStatus(st === "granted" ? "granted" : st === "denied" ? "denied" : "prompt")

        // Atualiza reativamente se o usuário mudar no browser
        // nem todos suportam onchange
        if (typeof res.onchange !== "undefined") {
          res.onchange = () => {
            const cur = res.state as PermissionState
            setStatus(cur === "granted" ? "granted" : cur === "denied" ? "denied" : "prompt")
          }
        }
      } catch (e: any) {
        // Alguns navegadores lançam aqui — trate como prompt
        setStatus("prompt")
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Tenta obter acesso (precisa ser chamado em um gesto do usuário)
  const ensureMicAccess = useCallback(async (opts?: MediaStreamConstraints) => {
    setRequesting(true)
    setLastError(undefined)
    try {
      const constraints: MediaStreamConstraints = opts ?? { audio: true, video: false }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // sucesso
      streamRef.current = stream
      setStatus("granted")
      return stream
    } catch (err: any) {
      // Erros comuns: NotAllowedError (bloqueado), NotFoundError (sem dispositivo), AbortError, NotReadableError
      const name = err?.name || "Error"
      const msg = err?.message || String(err)
      setLastError(`${name}: ${msg}`)

      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied")
      } else if (name === "NotFoundError") {
        // sem microfone disponível
        setStatus("error")
      } else {
        // outros erros — mantenha prompt para tentar de novo
        setStatus((s) => (s === "granted" ? "granted" : "prompt"))
      }
      return null
    } finally {
      setRequesting(false)
    }
  }, [])

  return { status, requesting, lastError, ensureMicAccess, stopCurrentStream }
}
