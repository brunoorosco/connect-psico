// hooks/useAudioRecorder.tsx
"use client"
import { useRef, useState } from "react"

type OnChunk = (chunk: Blob) => void

export function useAudioRecorder(onChunk: OnChunk) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // prefer codecs supported by browser; webm/opus é padrão moderno
    const options: MediaRecorderOptions = {}
    try {
      // tenta especificar mimeType quando suportado
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options.mimeType = "audio/webm;codecs=opus"
      }
    } catch (e) {}

    const recorder = new MediaRecorder(stream, options)
    mediaRecorderRef.current = recorder

    // envia blobs periódicos (timeslice) para onChunk
    recorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) onChunk(ev.data)
    }

    recorder.onstop = () => {
      // fecha stream
      try {
        stream.getTracks().forEach((t) => t.stop())
      } catch (e) {}
    }

    // timeslice: em ms (a cada 5s gera um chunk); ajuste se quiser mais/menos
    recorder.start(5000)
    setIsRecording(true)
    setRecordingTime(0)

    intervalRef.current = window.setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }

  const stop = () => {
    if (!mediaRecorderRef.current) return
    if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop()
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return { start, stop, isRecording, recordingTime }
}
