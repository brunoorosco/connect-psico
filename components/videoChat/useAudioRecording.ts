import { useSocket } from "@/infra/contexts/SocketContext"
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"
import { useState, useRef, useCallback, useEffect } from "react"
import type { Socket } from "socket.io-client"

type Transcription = {
  timestamp: number // Momento em que a transcrição foi recebida/salva
  text: string
}

type AudioRecordingState = {
  isRecording: boolean
  isUploading: boolean // Mantido para o objetivo original de gravação/upload
  isTranscribing: boolean
  error: string | null
  recordingDuration: number
  uploadProgress: number // Progresso do upload do áudio bruto, se ainda usado
  transcriptions: Transcription[]
}

type UseAudioRecordingProps = {
  roomId: string
  userId: string
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  socket?: Socket | null
  autoStart?: boolean
  chunkDuration?: number // ms, default 10000 (10 segundos)
  transcriptionChunkDuration?: number // ms, default 10000 (10 segundos) - para transcrever
}

export function useAudioRecording({
  roomId,
  userId,
  localStream,
  remoteStreams,
  socket: externalSocket,
  autoStart = false,
  chunkDuration = 10000, // Duração dos chunks para gravação/envio
  transcriptionChunkDuration = 10000, // Duração dos chunks para transcrição (10s)
}: UseAudioRecordingProps) {
  const { socket: contextSocket } = useSocket()
  const socket = externalSocket || contextSocket

  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isUploading: false,
    isTranscribing: false,
    error: null,
    recordingDuration: 0,
    uploadProgress: 0,
    transcriptions: [],
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null) // Stream mixado usado para gravação
  const intervalRef = useRef<NodeJS.Timeout | null>(null) // Para duration
  const chunkCountRef = useRef(0) // Contagem de chunks de áudio enviados
  const audioContextRef = useRef<AudioContext | null>(null) // Para mixagem de áudio

  // --- Controle de Tempo de Gravação ---
  useEffect(() => {
    const clear = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    if (state.isRecording) {
      intervalRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, recordingDuration: prev.recordingDuration + 1000 }))
      }, 1000)
    } else {
      clear()
    }
    return clear
  }, [state.isRecording])

  // --- Carregar Transcrições do LocalStorage ---
  useEffect(() => {
    const loadTranscriptions = () => {
      try {
        const storedTranscriptions = localStorage.getItem(`transcript_${roomId}_${userId}`)
        if (storedTranscriptions) {
          setState((prev) => ({
            ...prev,
            transcriptions: JSON.parse(storedTranscriptions),
          }))
        }
      } catch (e) {
        console.error("Erro ao carregar transcrições do localStorage:", e)
      }
    }
    loadTranscriptions()
  }, [roomId, userId])

  // --- Eventos Socket para Estado de Gravação ---
  useEffect(() => {
    if (!socket) return

    const onRecordingStarted = ({ userId: recordingUserId }: { userId: string }) => {
      if (recordingUserId === userId) {
        // Evento para este usuário
        setState((prev) => ({ ...prev, isRecording: true }))
        console.log(`Usuário ${recordingUserId} iniciou gravação.`)
      }
    }
    const onRecordingStopped = ({ userId: stoppedUserId }: { userId: string }) => {
      if (stoppedUserId === userId) {
        // Evento para este usuário
        setState((prev) => ({ ...prev, isRecording: false, recordingDuration: 0 }))
        console.log(`Usuário ${stoppedUserId} parou gravação.`)
      }
    }

    socket.on("recordingStarted", onRecordingStarted)
    socket.on("recordingStopped", onRecordingStopped)

    // Adicionar listener para receber transcrições do backend via socket
    const onTranscribedTextSocket = (response: {
      success: boolean
      text: string
      roomId: string
      userId: string
      chunkIndex: number
      error?: string
    }) => {
      if (response.roomId === roomId && response.userId === userId && response.success && response.text) {
        const newTranscription = {
          timestamp: Date.now(),
          text: response.text,
        }
        setState((prev) => {
          const updatedTranscriptions = [...prev.transcriptions, newTranscription]
          // Salva no localStorage
          try {
            localStorage.setItem(`transcript_${roomId}_${userId}`, JSON.stringify(updatedTranscriptions))
          } catch (e) {
            console.error("Erro ao salvar transcrição no localStorage:", e)
          }
          return { ...prev, transcriptions: updatedTranscriptions, isTranscribing: false }
        })
      } else if (!response.success) {
        console.error("Erro na transcrição via socket:", response.error)
        setState((prev) => ({
          ...prev,
          error: response.error || "Backend transcription failed",
          isTranscribing: false,
        }))
      }
    }
    socket.on("transcribedText", onTranscribedTextSocket)

    return () => {
      socket.off("recordingStarted", onRecordingStarted)
      socket.off("recordingStopped", onRecordingStopped)
      socket.off("transcribedText", onTranscribedTextSocket)
    }
  }, [socket, userId, roomId])

  // --- Função para realizar a transcrição (via API) ---
  const transcribeChunkAPI = useCallback(
    async (audioBlob: Blob, currentChunkIndex: number): Promise<string | null> => {
      setState((prev) => ({ ...prev, isTranscribing: true, error: null }))
      const currentTimestamp = Date.now() // Aproximação do início do chunk atual

      try {
        const formData = new FormData()
        formData.append("audio", audioBlob)
        formData.append("roomId", roomId)
        formData.append("userId", userId)
        formData.append("chunkIndex", currentChunkIndex.toString()) // Opcional: para rastreio no backend
        formData.append("timestamp", currentTimestamp.toString()) // Opcional: para contextualização no backend

        const response = await axiosInstance.post("/transcribe-audio-chunk", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // Timeout de 60 segundos para transcrição
        })

        if (response.data?.transcribedText) {
          console.log("✅ Transcrição recebida da API:", response.data.transcribedText)
          return response.data.transcribedText
        } else {
          throw new Error(response.data.error || "API retornou sem texto de transcrição")
        }
      } catch (err) {
        console.error("❌ Erro durante a transcrição via API:", err)
        setState((prev) => ({
          ...prev,
          error: `Falha na transcrição: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
        }))
        return null
      } finally {
        setState((prev) => ({ ...prev, isTranscribing: false }))
      }
    },
    [roomId, userId, axiosInstance],
  )

  // --- Função para enviar transcrição pelo Socket (se preferir backend a transcrever) ---
  const sendChunkForTranscriptionViaSocket = useCallback(
    async (audioBlob: Blob, currentChunkIndex: number): Promise<string | null> => {
      new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error("⚠️ Timeout esperando transcrição do backend via socket")
          setState((prev) => ({ ...prev, error: "Timeout de transcrição (backend)", isTranscribing: false }))
          reject(new Error("Backend transcription timeout"))
        }, 60000) // 60 segundos para o backend transcrever

        // Emitir o chunk para o backend processar
        socket?.emit("audioChunkForTranscription", {
          roomId,
          userId,
          chunkIndex: currentChunkIndex,
          blob: audioBlob.arrayBuffer(), // Enviar como ArrayBuffer
          mimeType: audioBlob.type,
          timestamp: Date.now(),
        })
        console.log("Chunk de áudio enviado para backend via socket para transcrição.")

        // Registrar listener AGORA para pegar a resposta desse chunk específico
        const onTranscribedTextSocketOnce = (response: {
          success: boolean
          text: string
          roomId: string
          userId: string
          chunkIndex: number
          error?: string
        }) => {
          clearTimeout(timeout)
          if (response.roomId === roomId && response.userId === userId && response.chunkIndex === currentChunkIndex) {
            if (response.success && response.text) {
              resolve(response.text)
            } else {
              console.error("Erro na transcrição do backend via socket:", response.error)
              setState((prev) => ({
                ...prev,
                error: response.error || "Backend transcription failed",
                isTranscribing: false,
              }))
              reject(new Error(response.error || "Backend transcription failed"))
            }
          }
          // IMPORTANTE: Remover este listener após a resposta, senão ele pode ser ativado por outros chunks.
          // O `socket.once` faz isso automaticamente.
        }
        socket?.once("transcribedText", onTranscribedTextSocketOnce)
      })
      return null // O resultado virá via `onTranscribedTextSocket` handler global
    },
    [roomId, userId, socket],
  )

  // --- Função Principal de Gravação e Transcrição ---
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        error: null,
        recordingDuration: 0,
        uploadProgress: 0,
        isTranscribing: false,
        transcriptions: [],
      })) // Reseta tudo

      if (!localStream) throw new Error("Local stream não disponível.")
      if (!socket && !axiosInstance) throw new Error("Sem socket ou axiosInstance para processamento.")
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("MediaDevices API não suportada.")

      // Criar AudioContext e mixar streams
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const destination = audioContext.createMediaStreamDestination()

      const mixedStream = new MediaStream() // Criar um novo stream para garantir controle

      // Adicionar fonte local
      const localSource = audioContext.createMediaStreamSource(localStream)
      localSource.connect(destination)
      localStream.getAudioTracks().forEach((track) => mixedStream.addTrack(track)) // Adicionar áudio local

      // Adicionar fontes remotas
      remoteStreams.forEach((stream) => {
        try {
          const remoteSource = audioContext.createMediaStreamSource(stream)
          remoteSource.connect(destination)
          stream.getAudioTracks().forEach((track) => mixedStream.addTrack(track)) // Adicionar áudio remoto
        } catch (err) {
          console.warn("Erro ao conectar remote stream para mixagem:", err)
        }
      })

      streamRef.current = destination.stream // Usar o stream mixado do AudioContext para gravação
      // O MediaRecorder precisa de um MediaStream. Aqui estamos usando o stream mixado DESTINO.
      // Se você quiser que o MediaRecorder grave APENAS o áudio, precisa passar apenas o audio track.
      // Vamos pegar os tracks de áudio do stream mixado.
      const audioTracksFromMixedStream = mixedStream.getAudioTracks()
      if (audioTracksFromMixedStream.length === 0) {
        throw new Error("Nenhum track de áudio disponível para gravação.")
      }
      const audioStreamForRecorder = new MediaStream(audioTracksFromMixedStream)

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4" // Fallback

      const mediaRecorder = new MediaRecorder(audioStreamForRecorder, {
        mimeType,
        audioBitsPerSecond: 128000, // Qualidade razoável
      })

      mediaRecorderRef.current = mediaRecorder
      chunkCountRef.current = 0 // Resetar contador

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunkCountRef.current++ // Incrementa antes de processar

          console.log(`Chunk ${chunkCountRef.current} recebido. Tamanho: ${event.data.size} bytes.`)

          // Opcional: Enviar áudio bruto para backend para gravação
          // await uploadAudioChunk(event.data, chunkCountRef.current);

          // Tenta transcrever o chunk
          let transcribedText: string | null = null
          if (socket) {
            // Opção 1: Chamar backend via socket para transcrever
            // await sendChunkForTranscriptionViaSocket(event.data, chunkCountRef.current); // Esta função atualiza o estado via onTranscribedTextSocket
          } else if (axiosInstance && typeof axiosInstance === 'object') {
            // Opção 2: Chamar backend via HTTP para transcrever
            transcribedText = await transcribeChunkAPI(event.data, chunkCountRef.current)
          } else {
            console.error("Sem handler para transcrição definido.")
          }

          if (transcribedText) {
            const newTranscription = {
              timestamp: Date.now(), // Momento em que a transcrição foi recebida/processada
              text: transcribedText,
            }
            setState((prev) => {
              const updatedTranscriptions = [...prev.transcriptions, newTranscription]
              // Salva no localStorage
              try {
                localStorage.setItem(`transcript_${roomId}_${userId}`, JSON.stringify(updatedTranscriptions))
              } catch (e) {
                console.error("Erro ao salvar transcrição no localStorage:", e)
              }
              return { ...prev, transcriptions: updatedTranscriptions, isTranscribing: false }
            })
          }
          // Se não houve erro e nem transcrição, é porque ou o backend está processando (via socket)
          // ou houve um erro silencioso que já foi logado.
        }
      }

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder parado.")
        setState((prev) => ({ ...prev, isRecording: false, isTranscribing: false })) // Parar gravação e transcribing
        streamRef.current?.getTracks().forEach((track) => track.stop()) // Parar tracks do stream mixado
        streamRef.current = null
        mediaRecorderRef.current = null

        // Limpar contexto de áudio e listener de temporizador
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        audioContextRef.current?.close()
        audioContextRef.current = null

        // Emitir evento 'stopRecording' para outros colegas
        socket?.emit("stopRecording", { roomId, userId })

        // Limpar transcrições salvas se a gravação parou
        // ATENÇÃO: Mantenha esta linha se você quiser APAGAR as transcrições ao parar.
        // Se quiser historicizar, comente ou remova.
        try {
          localStorage.removeItem(`transcript_${roomId}_${userId}`)
          setState((prevState) => ({ ...prevState, transcriptions: [] })) // Limpa estado tbm
          console.log("Transcrição atual limpada do localStorage.")
        } catch (e) {
          console.error("Erro ao limpar transcrição no localStorage:", e)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("Erro no MediaRecorder:", event.error)
        setState((prev) => ({
          ...prev,
          error: `Falha na gravação: ${event.error}`,
          isRecording: false,
          isTranscribing: false,
        }))
      }

      // Definir duration e iniciar recording/transcription
      mediaRecorder.start(transcriptionChunkDuration) // Começa a emitir 'ondataavailable' a cada X ms
      setState((prev) => ({ ...prev, isRecording: true, isTranscribing: true, recordingDuration: 0 })) // Reinicia duration e marca transcribing como true
      socket?.emit("startRecording", { roomId, userId }) // Notifica outros que esta gravação começou
    } catch (error: any) {
      console.error("Falha ao iniciar gravação/transcrição:", error)
      setState((prev) => ({
        ...prev,
        error: `Falha ao iniciar gravação: ${error.message}`,
        isRecording: false,
        isTranscribing: false,
      }))
      // Limpa o contexto de áudio se ele foi criado parcialmente
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [localStream, remoteStreams, roomId, userId, socket, axiosInstance, transcriptionChunkDuration]) // Dependências

  // --- Auto Start ---
  useEffect(() => {
    if (autoStart && !state.isRecording && !state.isTranscribing) {
      startRecording()
    }
  }, [autoStart, state.isRecording, state.isTranscribing, startRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop() // Dispara onstop
      // onstop irá resetar state.isRecording e limpar tudo.
    } else if (state.isTranscribing) {
      // Se não está gravando mas está transcrevendo (ex: iniciou por autoStart mas mediaRecorder falhou)
      setState((prev) => ({ ...prev, isRecording: false, isTranscribing: false, error: null }))
      if (intervalRef.current) clearInterval(intervalRef.current)
      audioContextRef.current?.close()
      try {
        localStorage.removeItem(`transcript_${roomId}_${userId}`)
        setState((prevState) => ({ ...prevState, transcriptions: [] }))
      } catch (e) {
        console.error("Erro ao limpar transcrição no localStorage:", e)
      }
    }
  }, [state.isRecording, state.isTranscribing, roomId, userId]) // Dependências para limpar estado

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.pause()
      setState((prev) => ({ ...prev, isRecording: false })) // Considerar pausa como "parada" temporária para o estado global
    }
  }, [state.isRecording])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && !state.isRecording) {
      mediaRecorderRef.current.resume()
      setState((prev) => ({ ...prev, isRecording: true }))
    }
  }, [state.isRecording])

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, []) // Executa apenas no unmount

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    // Formato MM:SS
    return `${minutes.toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration: (ms?: number) => formatDuration(ms || state.recordingDuration),
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    // O chunkCountRef.current aqui pode não ser útil diretamente para o UI,
    // pois ele é para o *envio* de chunks de áudio. A transcrição acontece *após* o chunk ser pronto.
  }
}
