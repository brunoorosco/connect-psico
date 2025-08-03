"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { VideoParticipant } from "@/components/video-chat/video-participant"
import { MediaControls } from "@/components/video-chat/media-controls"
import { ChatPanel } from "@/components/video-chat/chat-panel"
import { SettingsDialog } from "@/components/video-chat/settings-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { useChat, useMediaDevices, useWebRTC } from "@hooks/videoChat"
import { useCurrentUser } from "@hooks/use-current-user"

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const user = useCurrentUser()

  const roomId = params.roomId as string
  const userId = user?.id
  const userName = searchParams.get("userName") || undefined
  const avatar = searchParams.get("avatar") || undefined

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    socket,
    localStream,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    joinRoom,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = useWebRTC({
    roomId,
    userId: String(userId),
    avatar,
    userName: String(user?.name),
    serverUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  })

  const { messages, sendMessage } = useChat({
    socket,
    roomId,
    userId: String(userId),
    userName,
    avatar,
  })

  const { setSelectedAudioInput, setSelectedVideoInput } = useMediaDevices()

  useEffect(() => {
    const validateAccess = async () => {
      try {
        console.log("Acesso validado para:", { roomId, userId })
      } catch (error) {
        console.error("Erro na validação:", error)
        setError("Não foi possível validar o acesso à consulta")
      }
    }

    if (roomId && userId) {
      validateAccess()
    }
  }, [roomId, userId])

  useEffect(() => {
    if (isConnected && !hasJoined && !error) {
      joinRoom()
        .then(() => setHasJoined(true))
        .catch((err) => {
          console.error("Erro ao entrar na sala:", err)
          setError("Não foi possível entrar na videochamada")
        })
    }
  }, [isConnected, hasJoined, joinRoom, error])

  const handleLeaveCall = () => {
    leaveRoom()
    window.location.href = "/"
  }

  const handleDeviceChange = (deviceId: string, kind: MediaDeviceKind) => {
    if (kind === "audioinput") {
      setSelectedAudioInput(deviceId)
    } else if (kind === "videoinput") {
      setSelectedVideoInput(deviceId)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erro de Acesso</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => (window.location.href = "/")}>Voltar ao Início</Button>
        </div>
      </div>
    )
  }

  if (!isConnected || !hasJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {!isConnected ? "Conectando..." : "Entrando na sala..."}
          </h1>
          <p className="text-gray-400">Aguarde enquanto preparamos sua videochamada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 h-[calc(100vh-64px)] bg-gray-900 relative flex flex-col">
      {/* Grid de participantes */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden relative">
        {/* Grade com participantes (ajustável conforme necessário) */}
        <div
          className={`w-full h-full bg-black rounded-lg grid gap-2 sm:gap-4
      ${
        participants.length === 0
          ? "grid-cols-1"
          : participants.length === 1
          ? "grid-cols-1 sm:grid-cols-2"
          : participants.length <= 4
          ? "grid-cols-1 sm:grid-cols-2 sm:grid-rows-2"
          : "grid-cols-1 sm:grid-cols-3 sm:grid-rows-3"
      }`}
        >
          {participants.map((participant) => (
            <VideoParticipant
              key={participant.userId}
              userId={participant.userId}
              stream={participant.stream}
              isAudioEnabled={participant.isAudioEnabled}
              isVideoEnabled={participant.isVideoEnabled}
              avatar={participant.avatar}
              isLocal={false}
            />
          ))}
        </div>

        {/* Vídeo local no canto inferior direito */}
        <div className="absolute bottom-24 sm:bottom-4 md:bottom-4 right-4 w-28 h-28 sm:w-44 sm:h-44 md:w-44 md:h-44 rounded-lg shadow-lg border border-white z-10 bg-gray-800">
          <VideoParticipant
            userId={String(userId)}
            stream={localStream || undefined}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            avatar={avatar}
            isLocal={true}
            name={userName}
          />
        </div>
      </div>

      {/* Controles de mídia */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 px-2 w-full max-w-md">
        <MediaControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onLeaveCall={handleLeaveCall}
          isChatOpen={isChatOpen}
        />
      </div>

      {/* Painel de chat */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        currentUserId={String(userId)}
      />

      {/* Dialog de configurações */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeviceChange={handleDeviceChange}
      />

      {/* Informações da sala */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-white text-sm">
          <div className="font-medium">Sala: {roomId}</div>
          <div className="text-gray-300">
            {participants.length + 1} participante
            {participants.length !== 0 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Status de conexão */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-sm font-medium">{isConnected ? "Conectado" : "Desconectado"}</span>
        </div>
      </div>
    </div>
  )
}
