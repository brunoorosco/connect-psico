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

  const userName = String(user?.name)
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
    window.location.href = "/app"
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
    <div className="h-[calc(100vh-50px)] bg-gray-900 flex flex-col md:flex-row">
      {/* Parte principal com participantes */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className={`h-full w-full bg-black rounded-lg grid gap-2 sm:gap-4
          ${
            participants.length === 1
              ? "grid-cols-1"
              : participants.length === 2
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
              name={participant.userName}
            />
          ))}
        </div>

        {/* Controles de mídia centralizados no fundo */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
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

        {/* Mini vídeo local flutuante em mobile */}
        <div className="fixed bottom-20 right-4 w-24 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden z-30 shadow-lg border border-white/10 md:hidden">
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

      {/* Área lateral visível apenas no desktop */}
      <div className="hidden md:flex md:w-[280px] p-4 flex-col justify-between bg-black/30 backdrop-blur-md border-l border-white/10">
        {/* Info da sala */}
        <div className="text-white text-sm space-y-1 mb-4">
          <div className="font-medium">Sala: {roomId}</div>
          <div className="text-gray-300">
            {participants.length + 1} participante{participants.length !== 0 ? "s" : ""}
          </div>
          <div className={`flex items-center gap-2 text-sm`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
            {isConnected ? "Conectado" : "Desconectado"}
          </div>
        </div>

        {/* Mini vídeo local */}
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-md">
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

      {/* Chat Panel flutuante */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        currentUserId={String(userId)}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeviceChange={handleDeviceChange}
      />
    </div>
  )
}
