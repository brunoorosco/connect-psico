import { useRef, useState } from "react"

export function useMixedAudioRecording(localStream: MediaStream | null, remoteStreams: MediaStream[]) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])

  const startRecording = () => {
    if (!localStream) {
      console.warn("Nenhum localStream disponível")
      return
    }

    // Garante tracks de áudio
    if (localStream.getAudioTracks().length === 0) {
      console.warn("localStream sem track de áudio")
      return
    }

    audioContextRef.current = new AudioContext()
    destinationRef.current = audioContextRef.current.createMediaStreamDestination()

    // Conecta áudio local
    const localSource = audioContextRef.current.createMediaStreamSource(localStream)
    localSource.connect(destinationRef.current)

    // Conecta áudios remotos
    remoteStreams.forEach((stream) => {
      if (stream.getAudioTracks().length > 0) {
        const remoteSource = audioContextRef.current!.createMediaStreamSource(stream)
        remoteSource.connect(destinationRef.current!)
      }
    })

    const mixedStream = destinationRef.current.stream

    const mediaRecorder = new MediaRecorder(mixedStream, { mimeType: "audio/webm" })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data])
      }
    }

    mediaRecorder.onstart = () => {
      // console.log("MediaRecorder começou a gravar")
    }

    mediaRecorderRef.current = mediaRecorder
    setRecordedChunks([])
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    audioContextRef.current?.close()
    audioContextRef.current = null
    destinationRef.current = null
    setIsRecording(false)
  }

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
  }
}
