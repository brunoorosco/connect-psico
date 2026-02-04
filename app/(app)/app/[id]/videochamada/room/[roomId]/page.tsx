"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useChat, useWebRTC } from "@hooks/videoChat"
import { useAudioRecording } from "@components/videoChat/useAudioRecording"
import { ChatOverlay } from "@components/videoChat/ChatOverlay"
import { SidebarMenu } from "@components/videoChat/SidebarMenu"
import { WaitingMessage } from "@components/videoChat/WaitingMessage"
import { VideoParticipant } from "@components/videoChat/VideoParticipant"
import { useCurrentUser } from "@hooks/use-current-user"
import { MobileControls } from "@components/videoChat/MobileControls"
import { HeaderControls } from "@components/videoChat/HeaderControls"
import { env } from "@/config/application"
import { useMixedAudioRecording } from "@hooks/videoChat/useMixedAudioRecording"
import { SettingsDialogDynamic as SettingsDialog } from "@components/videoChat/SettingsDialogDynamic"

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
  const [hasJoined, setHasJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinRoom = () => {
    if (roomId && userId && !isJoining) {
      setIsJoining(true) // Marca que está em processo de join
      console.log(`Iniciando joinRoom para ${roomId} por ${userId}`)
      joinRoom()
      setHasJoined(true)
      // Não resetar isJoining aqui, apenas quando socket se conectar de fato
      // ou quando houver um timeout/erro.
    }
  }

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
    socket,
  } = useWebRTC({
    roomId,
    userId,
    avatar,
    userName: String(userName),
    serverUrl: env.baseUrlPsicomaisApi,
  })
  const remoteStreams = participants
    .map((p) => p.stream)
    .filter((s): s is MediaStream => s !== undefined && s !== null && s !== localStream)
  // Initialize Chat
  const { messages, sendMessage } = useChat({
    socket,
    roomId,
    userId,
    userName: String(userName),
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
    localStream, // stream do próprio microfone
    remoteStreams,
    socket,
    autoStart: false, // Start recording automatically when joining
  })

  useEffect(() => {
    // Chamada inicial para entrar na sala se o usuário e a sala estiverem definidos
    // e se a conexão ainda não foi estabelecida ou está em processo.
    // Evitar re-joining se já tem participantes ou está conectado.
    if (roomId && userId && !hasJoined && participants.length === 0 && connectionStatus === "connecting") {
      console.log("Tentativa automática de entrar na sala...")
      handleJoinRoom()
    }
  }, [roomId, userId, hasJoined, participants, connectionStatus, handleJoinRoom]) // Adicionar dependências necessárias

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected")
      setIsJoining(false) // Resetar o estado de join
      console.log("Conexão WebRTC estabelecida.")
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
    setHasJoined(false)
    window.location.href = "../../../"
  }

  // Usa o hook para gravar o áudio mixado
  const {
    isRecording: isMixedRecording,
    recordedChunks,
    startRecording: startMixedRecording,
    stopRecording: stopMixedRecording,
  } = useMixedAudioRecording(localStream, remoteStreams)

  const handleToggleRecording = () => {
    if (isMixedRecording) {
      stopMixedRecording()
      stopRecording()
    } else {
      startRecording()
      startMixedRecording()
    }
  }
  const audioURL = recordedChunks.length > 0 ? URL.createObjectURL(new Blob(recordedChunks)) : null

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
      <HeaderControls
        btnRecorder={user?.role !== "DEFAULT"}
        roomId={roomId}
        participantCount={participants.length + 1}
        isRecording={isMixedRecording}
        isUploading={isUploading}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        audioAvailable={audioAvailable}
        videoAvailable={videoAvailable}
        formatDuration={formatDuration}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleRecording={handleToggleRecording}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveCall={handleLeaveCall}
      />
      {/* {audioURL && (
        <div className="fixed bottom-20 left-45 bg-gray-800 p-2 rounded">
          <audio controls src={audioURL} />
        </div>
      )} */}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Menu */}
        <SidebarMenu
          currentUserId={userId}
          currentUserName={String(userName)}
          currentUserAvatar={avatar}
          participants={participants.map((p) => ({
            userId: p.userId,
            userName: String(p.userName),
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
          className="hidden md:block"
        />

        {/* Video Grid */}
        <div className="flex-1 p-4 relative">
          {showWaitingMessage ? (
            <WaitingMessage
              isWaiting={hasJoined}
              userName={String(userName)}
              onJoinRoom={handleJoinRoom}
              roomId={roomId}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onOpenSettings={() => setIsSettingsOpen(true)}
              localVideoRef={localVideoRef}
            />
          ) : (
            <div className="h-full relative">
              {/* 📌 Participantes */}
              {participants.length === 1 ? (
                <VideoParticipant
                  key={participants[0].userId}
                  userId={participants[0].userId}
                  name={participants[0].userName}
                  isAudioEnabled={participants[0].isAudioEnabled}
                  isVideoEnabled={participants[0].isVideoEnabled}
                  avatar={participants[0].avatar}
                  stream={participants[0].stream}
                  isSingleParticipant={true}
                  isLocal={false}
                />
              ) : (
                <div
                  className={`grid gap-2 h-full ${
                    participants.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"
                  }`}
                >
                  {participants.map((participant) => (
                    <VideoParticipant
                      key={participant.userId}
                      userId={participant.userId}
                      name={participant.userName}
                      isAudioEnabled={participant.isAudioEnabled}
                      isVideoEnabled={participant.isVideoEnabled}
                      avatar={participant.avatar}
                      stream={participant.stream}
                      isSingleParticipant={false}
                      isLocal={false}
                    />
                  ))}
                </div>
              )}

              {/* 👤 Seu vídeo local no canto inferior direito */}
              {isVideoEnabled && (
                <div className="absolute bottom-4 right-4 w-40 h-24 bg-black rounded-md overflow-hidden shadow-lg border border-white/20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
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
          userName: String(p.userName),
          avatar: p.avatar,
          isConnected: true,
        }))}
        currentUserId={userId}
        currentUserName={String(userName)}
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
      <div className="hidden">
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
      <MobileControls
        isAudioEnabled={isAudioEnabled}
        btnRecorder={user?.role !== "DEFAULT"}
        isVideoEnabled={isVideoEnabled}
        isRecording={isRecording}
        audioAvailable={audioAvailable}
        videoAvailable={videoAvailable}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleRecording={handleToggleRecording}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  )
}
