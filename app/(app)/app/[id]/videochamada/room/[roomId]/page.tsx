"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"

import { PhoneOff, Mic, MicOff, Video, VideoOff, Settings, MessageSquare, Users, CircleDot, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat, useWebRTC } from "@hooks/videoChat"
import { useAudioRecording } from "@components/videoChat/useAudioRecording"
import { ChatOverlay } from "@components/videoChat/ChatOverlay"
import { SidebarMenu } from "@components/videoChat/SidebarMenu"
import { WaitingMessage } from "@components/videoChat/WaitingMessage"
import { VideoParticipant } from "@components/videoChat/VideoParticipant"
import { SettingsDialog } from "@components/videoChat/SettingsDialog"
import { useCurrentUser } from "@hooks/use-current-user"

export default function VideoCallPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const user = useCurrentUser()
  const userId = user?.id as string
  const userName = user?.name
  const avatar = user?.image || undefined

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  // Initialize WebRTC
  const {
    localStream,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    audioAvailable,
    videoAvailable,
    isConnected,
    error: webrtcError,
    joinRoom,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    socket
  } = useWebRTC({
    roomId,
    userId,
    avatar,
    serverUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
  })

  // Initialize Chat
  const { messages, sendMessage } = useChat({
    socket,
    roomId,
    userId,
    userName: userName || `User ${userId}`,
  })

  // Initialize Audio Recording
  const {
    isRecording,
    isUploading,
    recordingDuration,
    startRecording,
    stopRecording,
    formatDuration,
    error: recordingError,
  } = useAudioRecording({
    roomId,
    userId,
    socket,
    autoStart: true, // Start recording automatically when joining
  })

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected")
    } else {
      setConnectionStatus("connecting")
    }
  }, [isConnected])

  // Join room on mount
  useEffect(() => {
    if (roomId && userId) {
      joinRoom()
    }
  }, [roomId, userId, joinRoom])

  // Set up local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const handleSendMessage = (message: string) => {
    sendMessage(message)
  }

  const handleLeaveCall = () => {
    leaveRoom()
    if (isRecording) {
      stopRecording()
    }
    window.location.href = "../"
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleDeviceChange = (deviceId: string, kind: MediaDeviceKind) => {
    console.log("Dispositivo alterado:", deviceId, kind)
    // Aqui você pode aplicar as mudanças nos dispositivos
    // como, por exemplo, reinicializar a stream local com o novo deviceId
  }
  // Show waiting message if no participants
  const showWaitingMessage = participants.length === 0

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">Sala: {roomId}</h1>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                {participants.length + 1} participante{participants.length !== 0 ? "s" : ""}
              </span>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center space-x-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC {formatDuration()}</span>
              </div>
            )}

            {isUploading && <div className="text-sm text-yellow-400">Enviando áudio...</div>}
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={!audioAvailable ? "outline" : isAudioEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={toggleAudio}
              disabled={!audioAvailable}
              title={
                !audioAvailable
                  ? "Microfone não disponível"
                  : isAudioEnabled
                  ? "Desativar microfone"
                  : "Ativar microfone"
              }
            >
              {!audioAvailable ? (
                <MicOff className="w-4 h-4 opacity-50" />
              ) : isAudioEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant={!videoAvailable ? "outline" : isVideoEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={toggleVideo}
              disabled={!videoAvailable}
              title={!videoAvailable ? "Câmera não disponível" : isVideoEnabled ? "Desativar câmera" : "Ativar câmera"}
            >
              {!videoAvailable ? (
                <VideoOff className="w-4 h-4 opacity-50" />
              ) : isVideoEnabled ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={handleToggleRecording}
              title={isRecording ? "Parar gravação" : "Iniciar gravação"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <CircleDot className="w-4 h-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsChatOpen(true)}>
              <MessageSquare className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>

            <Button variant="destructive" size="sm" onClick={handleLeaveCall}>
              <PhoneOff className="w-4 h-4" />
              <span className="ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Menu */}
        <SidebarMenu
          currentUserId={userId}
          currentUserName={userName || `User ${userId}`}
          currentUserAvatar={avatar}
          participants={participants.map((p) => ({
            userId: p.userId,
            userName: p.userName || `User ${p.userId}`,
            isAudioEnabled: p.isAudioEnabled,
            isVideoEnabled: p.isVideoEnabled,
            avatar: p.avatar,
            isConnected: true,
          }))}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          localVideoRef={localVideoRef}
          connectionStatus={connectionStatus}
          roomId={roomId}
        />

        {/* Video Grid */}
        <div className="flex-1 p-4">
          {showWaitingMessage ? (
            <WaitingMessage
              userName={userName || `User ${userId}`}
              roomId={roomId}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onOpenSettings={() => setIsSettingsOpen(true)}
              localVideoRef={localVideoRef}
            />
          ) : (
            <div className="h-full">
              {/* Participants Grid */}
              <div
                className={`grid gap-4 h-full ${
                  participants.length === 1
                    ? "grid-cols-1"
                    : participants.length === 2
                    ? "grid-cols-2"
                    : participants.length <= 4
                    ? "grid-cols-2 grid-rows-2"
                    : participants.length <= 6
                    ? "grid-cols-3 grid-rows-2"
                    : "grid-cols-3 grid-rows-3"
                }`}
              >
                {participants.map((participant) => (
                  <VideoParticipant
                    key={participant.userId}
                    userId={participant.userId}
                    name={participant.userName || `User ${participant.userId}`}
                    isAudioEnabled={participant.isAudioEnabled}
                    isVideoEnabled={participant.isVideoEnabled}
                    avatar={participant.avatar}
                    stream={participant.stream}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Local Video (for sidebar mini video) */}
      <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />

      {/* Chat Overlay */}
      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        //@ts-ignore
        messages={messages.map((msg) => ({
          ...msg,
          isOwn: msg.userId === userId,
        }))}
        participants={participants.map((p) => ({
          userId: p.userId,
          userName: p.userName || `User ${p.userId}`,
          avatar: p.avatar,
          isConnected: true,
        }))}
        currentUserId={userId}
        currentUserName={userName || `User ${userId}`}
        currentUserAvatar={avatar}
        onSendMessage={handleSendMessage}
        roomId={roomId}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeviceChange={handleDeviceChange}
      />

      {/* Error Messages */}
      {webrtcError && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="font-semibold">Erro de Mídia</div>
          <div className="text-sm">{webrtcError}</div>
        </div>
      )}

      {recordingError && (
        <div className="fixed bottom-16 left-30 bg-yellow-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="font-semibold">Erro de Gravação</div>
          <div className="text-sm">{recordingError}</div>
        </div>
      )}

      {/* Device Status Indicators */}
      {!audioAvailable && (
        <div className="fixed bottom-4 right-4 bg-orange-600 text-white p-3 rounded-lg shadow-lg">
          <div className="text-sm">⚠️ Microfone não disponível</div>
        </div>
      )}

      {!videoAvailable && (
        <div className="fixed bottom-16 right-4 bg-orange-600 text-white p-3 rounded-lg shadow-lg">
          <div className="text-sm">⚠️ Câmera não disponível</div>
        </div>
      )}
    </div>
  )
}
