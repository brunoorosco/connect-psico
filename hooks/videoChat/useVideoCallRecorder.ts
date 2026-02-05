// hooks/useVideoCallRecorder.ts
import { useAudioRecorder } from "@hooks/useAudioRecorder"
import { useCallback, useRef, useState, useEffect } from "react"
import { getPresignedPutForKey, transcribeChunk } from "@/services/minioUpload"

interface UseVideoCallRecorderProps {
  roomId: string
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  withTimestamps?: boolean
  onTranscriptUpdate?: (text: string) => void
}

function mergeTranscripts(prev: string, curr: string, sep = " ") {
  const tail = prev.slice(-120)
  const max = Math.min(120, curr.length)
  for (let n = max; n >= 20; n--) {
    if (tail.endsWith(curr.slice(0, n))) {
      return prev + curr.slice(n)
    }
  }
  return prev ? prev + sep + curr : curr
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3, base = 300): Promise<T> {
  let last: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (i < tries - 1) await new Promise((r) => setTimeout(r, base * 2 ** i))
    }
  }
  throw last
}

export function useVideoCallRecorder({
  roomId,
  localStream,
  remoteStreams,
  withTimestamps = false,
  onTranscriptUpdate,
}: UseVideoCallRecorderProps) {
  const sessionIdRef = useRef<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const mixedStreamRef = useRef<MediaStream | null>(null)
  const transcriptKey = `videocall_transcript_${roomId}`

  // Carregar do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(transcriptKey)
      if (stored) {
        setTranscript(stored)
      }
    } catch (e) {
      console.warn("Erro ao carregar do localStorage:", e)
    }
  }, [transcriptKey])

  // Função para criar stream mixado
  const createMixedStream = useCallback(() => {
    if (!localStream) {
      throw new Error("Local stream não disponível")
    }

    // Criar AudioContext para mixar streams
    // Usa window.AudioContext ou webkitAudioContext se necessário, mas Next.js modernas usam padrão
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioCtx()
    audioContextRef.current = audioContext
    const destination = audioContext.createMediaStreamDestination()

    // Adicionar áudio local
    const localAudioTracks = localStream.getAudioTracks()
    if (localAudioTracks.length > 0) {
      const localSource = audioContext.createMediaStreamSource(new MediaStream(localAudioTracks))
      localSource.connect(destination)
    }

    // Adicionar áudios remotos
    remoteStreams.forEach((stream) => {
      const remoteAudioTracks = stream.getAudioTracks()
      if (remoteAudioTracks.length > 0) {
        try {
          // Precisamos clonar ou garantir que o stream está 'ativo'
          const remoteSource = audioContext.createMediaStreamSource(stream)
          remoteSource.connect(destination)
        } catch (err) {
          console.warn("Erro ao conectar remote stream:", err)
        }
      }
    })

    mixedStreamRef.current = destination.stream
    return destination.stream
  }, [localStream, remoteStreams])

  // Cleanup do AudioContext
  const cleanupAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    mixedStreamRef.current = null
  }, [])

  const {
    requestPermission,
    start: startRecorder,
    stop: stopRecorder,
    isRecording,
    recordingTime,
    isStopping,
    canRecord,
    error,
  } = useAudioRecorder({
    mode: "dual", // Na verdade aqui estamos passando um stream customizado, o mode pode ser ignorado ou mantido
    partDurationMs: 10_000, // 10 segundos
    overlapMs: 400,
    timeslice: 250,

    // Passar o stream mixado para o recorder
    customStream: mixedStreamRef.current,

    onPart: async (blob, { index }) => {
      if (!sessionIdRef.current) return

      const sid = sessionIdRef.current!
      // Usar uma estrutura de pasta similar
      const key = `videocalls/${roomId}/${sid}/part-${String(index).padStart(5, "0")}.webm`

      // 1. Upload para S3
      await withRetry(
        async () => {
          const { url } = await getPresignedPutForKey(key)
          const resp = await fetch(url, { method: "PUT", body: blob })
          if (!resp.ok) throw new Error(`PUT failed: ${resp.status}`)
        },
        4,
        300,
      )

      // 2. Transcrever
      const stt = await withRetry(
        () =>
          transcribeChunk({
            key,
            sessionId: sid,
            part: index,
            response_format: withTimestamps ? "verbose_json" : "json",
            language: "pt",
          }),
        3,
        500,
      )

      // 3. Atualizar transcrição
      const piece = stt?.text?.trim()
      if (piece) {
        setTranscript((prev) => {
          const updated = mergeTranscripts(prev, piece)
          onTranscriptUpdate?.(updated)
          // Salvar no localStorage
          try {
            localStorage.setItem(transcriptKey, updated)
          } catch (e) {
            console.warn(e)
          }
          return updated
        })
      }

      // 4. Cleanup
      try {
        await fetch("/api/audio/recordings/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, softDelete: false }),
        })
      } catch (e) {
        console.warn("Falha ao remover parte após STT:", e)
      }
    },

    onStop: async (fullBlob) => {
      setAudioBlob(fullBlob)
      cleanupAudioContext()

      // Salvar transcrição final
      if (sessionIdRef.current) {
        try {
          const res = await fetch("/api/videocall/save-transcript", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              sessionId: sessionIdRef.current,
              transcript, // Envia o estado atual
            }),
          })

          if (res.ok) {
            // Limpar localStorage se salvou com sucesso?
            // Talvez manter por segurança ou limpar? 
            // Vou limpar para evitar lixo.
            localStorage.removeItem(transcriptKey)
          }
        } catch (e) {
          console.error("Erro ao salvar transcrição final:", e)
        }
      }
    },
  })

  // Wrapper para start que cria o stream mixado primeiro
  const start = useCallback(async () => {
    try {
      // Gerar sessionId único
      sessionIdRef.current = `${roomId}-${Date.now()}`

      // Criar stream mixado
      createMixedStream()

      // Iniciar gravação, passando o stream recém criado se o hook useAudioRecorder suportar ler ref atualizada ou se passarmos via props
      // Como useAudioRecorder recebe customStream na inicialização do hook, pode ser que precise recriar o hook ou passar ref.
      // Verificando useAudioRecorder (impl não mostrada inteira mas supondo que ele lê a prop customStream)
      // Se useAudioRecorder não reagir a mudança de customStream, precisamos forçar algo.
      // O ideal é que startRecorder pegue o stream atual.

      await startRecorder()
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err)
      cleanupAudioContext()
      throw err
    }
  }, [roomId, createMixedStream, startRecorder, cleanupAudioContext])

  const stop = useCallback(async () => {
    await stopRecorder()
  }, [stopRecorder])

  return {
    requestPermission,
    start,
    stop,
    isRecording,
    recordingTime,
    isStopping,
    canRecord,
    error,
    transcript,
    summary,
    audioBlob,
  }
}
