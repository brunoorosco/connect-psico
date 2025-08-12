import { useSocket } from "@/infra/contexts/SocketContext";
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Socket } from "socket.io-client";

interface AudioRecordingState {
  isRecording: boolean;
  isUploading: boolean;
  error: string | null;
  recordingDuration: number;
  uploadProgress: number;
}

interface UseAudioRecordingProps {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  socket?: Socket | null;
  autoStart?: boolean;
  chunkDuration?: number; // em ms
}

export function useAudioRecording({
  roomId,
  userId,
  localStream,
  remoteStreams,
  socket: externalSocket,
  autoStart = false,
  chunkDuration = 10000,
}: UseAudioRecordingProps) {
  const { socket: contextSocket } = useSocket();
  const socket = externalSocket || contextSocket;

  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isUploading: false,
    error: null,
    recordingDuration: 0,
    uploadProgress: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunkCountRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Controla o tempo da gravação
  useEffect(() => {
    const clear = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (state.isRecording) {
      intervalRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, recordingDuration: prev.recordingDuration + 1000 }));
      }, 1000);
    } else {
      clear();
    }

    return clear;
  }, [state.isRecording]);

  // Evento socket para atualizar estado global de gravação
  useEffect(() => {
    if (!socket) return;

    socket.on("recordingStarted", ({ userId }) => {
      setState((prev) => ({
        ...prev,
        isRecording: true,
      }));
      console.log(`Usuário ${userId} começou a gravar`);
    });

    socket.on("recordingStopped", ({ userId }) => {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        recordingDuration: 0,
      }));
      console.log(`Usuário ${userId} parou de gravar`);
    });

    return () => {
      socket.off("recordingStarted");
      socket.off("recordingStopped");
    };
  }, [socket]);

  // Se autoStart estiver ativo, iniciar gravação automaticamente
  useEffect(() => {
    if (autoStart && !state.isRecording) {
      startRecording();
    }
  }, [autoStart, state.isRecording]);

  const uploadAudioChunk = useCallback(
    async (audioBlob: Blob, chunkIndex: number) => {
      setState((prev) => ({ ...prev, isUploading: true }));

      try {
        if (socket) {
          const arrayBuffer = await audioBlob.arrayBuffer();
          socket.emit("audioChunk", {
            roomId,
            userId,
            chunkCountRef: chunkCountRef.current,
            chunkData: arrayBuffer,
            mimeType: audioBlob.type,
          });

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.error("⚠️ Timeout esperando chunkReceived");
              reject(new Error("Upload timeout"));
            }, 30000);

            socket.once("chunkReceived", (response) => {
              clearTimeout(timeout);
              console.log("✅ Confirmação recebida do servidor:", response);
              response.success ? resolve() : reject(new Error(response.error || "Upload failed"));
            });
          });
        } else {
          const formData = new FormData();
          formData.append("audio", audioBlob);
          formData.append("roomId", roomId);
          formData.append("userId", userId);
          formData.append("chunkIndex", chunkIndex.toString());
          formData.append("mimeType", audioBlob.type);

          const response = await axiosInstance.post("/upload-audio-chunk", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          console.log("✅ Resposta upload via HTTP:", response.data);
        }
      } catch (err) {
        console.error("❌ Erro enviando chunk:", err);
        setState((prev) => ({
          ...prev,
          error: `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        }));
      } finally {
        setState((prev) => ({ ...prev, isUploading: false }));
      }
    },
    [roomId, userId, socket]
  );

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, recordingDuration: 0, uploadProgress: 0 }));

      if (!localStream) throw new Error("Local stream não disponível");

      // Criar AudioContext e mixar streams
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      // Fonte local
      const localSource = audioContext.createMediaStreamSource(localStream);
      localSource.connect(destination);

      // Fontes remotas
      remoteStreams.forEach((stream) => {
        try {
          const remoteSource = audioContext.createMediaStreamSource(stream);
          remoteSource.connect(destination);
        } catch (err) {
          console.warn("Erro ao conectar remote stream", err);
        }
      });

      const mixedStream = destination.stream;
      streamRef.current = mixedStream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunkCountRef.current = 0;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await uploadAudioChunk(event.data, chunkCountRef.current);
          chunkCountRef.current++;
          setState((prev) => ({
            ...prev,
            uploadProgress:
              (chunkCountRef.current / Math.ceil(prev.recordingDuration / chunkDuration)) * 100,
          }));
        }
      };

      mediaRecorder.onstop = () => {
        setState((prev) => ({ ...prev, isRecording: false }));
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;

        // Fechar contexto para liberar recursos
        audioContextRef.current?.close();
        audioContextRef.current = null;
      };

      mediaRecorder.onerror = () => {
        setState((prev) => ({ ...prev, error: "Recording error occurred", isRecording: false }));
      };

      mediaRecorder.start(chunkDuration);
      setState((prev) => ({ ...prev, isRecording: true }));
      socket?.emit("startRecording", { roomId, userId });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to start recording: ${error instanceof Error ? error.message : "Unknown error"}`,
        isRecording: false,
      }));
    }
  }, [localStream, remoteStreams, roomId, userId, socket, chunkDuration, uploadAudioChunk]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      socket?.emit("stopRecording", { roomId, userId });
    }
  }, [roomId, userId, socket, state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.pause();
    }
  }, [state.isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.resume();
    }
  }, [state.isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isRecording) stopRecording();
      intervalRef.current && clearInterval(intervalRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return hours > 0
      ? `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
      : `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration: (ms?: number) => formatDuration(ms || state.recordingDuration),
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    chunkCount: chunkCountRef.current,
  };
}
