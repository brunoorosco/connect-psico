"use client"

import { useSocket } from "@/infra/contexts/SocketContext"
import { useState, useRef, useCallback, useEffect } from "react"
import { io, Socket } from "socket.io-client"

interface AudioRecordingState {
  isRecording: boolean
  isUploading: boolean
  error: string | null
  recordingDuration: number
  uploadProgress: number
}

interface UseAudioRecordingProps {
  roomId: string
  userId: string
  socket?: Socket | null
  autoStart?: boolean
  chunkDuration?: number // in milliseconds
}

export function useAudioRecording({
  roomId,
  userId,
  socket: externalSocket,
  autoStart = false,
  chunkDuration = 10000,
}: UseAudioRecordingProps) {

  const { socket: contextSocket } = useSocket()
  const socket = externalSocket || contextSocket
  
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isUploading: false,
    error: null,
    recordingDuration: 0,
    uploadProgress: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunkCountRef = useRef(0)

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

  useEffect(() => {
    if (autoStart && !state.isRecording) {
      startRecording()
    }
  }, [autoStart])

  const uploadAudioChunk = useCallback(
    async (audioBlob: Blob, chunkIndex: number) => {
      setState((prev) => ({ ...prev, isUploading: true }))

      try {
        if (socket) {
          const arrayBuffer = await audioBlob.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          socket.emit("audioChunk", {
            roomId,
            userId,
            chunkData: Array.from(uint8Array),
            mimeType: audioBlob.type,
          })

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Upload timeout")), 30000)
            socket.once("chunkReceived", (response) => {
              clearTimeout(timeout)
              response.success ? resolve() : reject(new Error(response.error || "Upload failed"))
            })
          })
        } else {
          const formData = new FormData()
          formData.append("audio", audioBlob)
          formData.append("roomId", roomId)
          formData.append("userId", userId)
          formData.append("chunkIndex", chunkIndex.toString())
          formData.append("mimeType", audioBlob.type)

          const response = await fetch("/api/upload-audio-chunk", {
            method: "POST",
            body: formData,
          })

          const result = await response.json()
          if (!response.ok || !result.success) throw new Error(result.error || "Upload failed")
        }
      } finally {
        setState((prev) => ({ ...prev, isUploading: false }))
      }
    },
    [roomId, userId, socket]
  )

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, recordingDuration: 0, uploadProgress: 0 }))

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []
      chunkCountRef.current = 0

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            await uploadAudioChunk(event.data, chunkCountRef.current)
            chunkCountRef.current++
            setState((prev) => ({
              ...prev,
              uploadProgress: (chunkCountRef.current / Math.ceil(prev.recordingDuration / chunkDuration)) * 100,
            }))
          } catch (err) {
            setState((prev) => ({
              ...prev,
              error: `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            }))
          }
        }
      }

      mediaRecorder.onstop = () => {
        setState((prev) => ({ ...prev, isRecording: false }))
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      mediaRecorder.onerror = () => {
        setState((prev) => ({ ...prev, error: "Recording error occurred", isRecording: false }))
      }

      mediaRecorder.start(chunkDuration)
      setState((prev) => ({ ...prev, isRecording: true }))
      socket?.emit("startRecording", { roomId, userId })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to start recording: ${error instanceof Error ? error.message : "Unknown error"}`,
        isRecording: false,
      }))
    }
  }, [roomId, userId, socket, chunkDuration, uploadAudioChunk])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      socket?.emit("stopRecording", { roomId, userId })
    }
  }, [roomId, userId, socket, state.isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.pause()
    }
  }, [state.isRecording])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.resume()
    }
  }, [state.isRecording])

  useEffect(() => {
    return () => {
      if (state.isRecording) stopRecording()
      intervalRef.current && clearInterval(intervalRef.current)
    }
  }, [])

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return hours > 0
      ? `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
      : `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration: (ms?: number) => formatDuration(ms || state.recordingDuration),
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    chunkCount: chunkCountRef.current,
  }
}
