import React, { RefObject } from "react"
import { Users, Clock, Wifi, Mic, MicOff, Video, VideoOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WaitingMessageProps {
  roomId: string
  userName?: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onOpenSettings: () => void
  onJoinRoom: () => void
  localVideoRef: RefObject<HTMLVideoElement>
}

export function WaitingMessage({
  roomId,
  userName,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onOpenSettings,
  localVideoRef,
  onJoinRoom
}: WaitingMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-blue-400" />
          </div>

          {/* Pulse Circles */}
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-2 w-20 h-20 mx-auto">
            <div className="w-full h-full bg-blue-500/20 rounded-full animate-ping animation-delay-200"></div>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-white mb-4">Aguardando outros participantes</h1>

        <p className="text-gray-300 text-lg mb-6">
          {userName ? `Olá, ${userName}! ` : ""}
          Você está na sala e aguardando outros participantes se juntarem à videochamada.
        </p>

        {/* Room Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-gray-400 mb-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Conectado</span>
          </div>

          <div className="text-white font-medium">
            Sala: <span className="text-blue-400">{roomId}</span>
          </div>
        </div>

        {/* Local Video Preview (Optional) */}
        <div className="w-32 h-24 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        </div>

        {/* Media Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button variant={isAudioEnabled ? "secondary" : "destructive"} size="icon" onClick={onToggleAudio}>
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button variant={isVideoEnabled ? "secondary" : "destructive"} size="icon" onClick={onToggleVideo}>
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={onOpenSettings}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Tips */}
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Compartilhe o ID da sala com outros participantes</span>
          </div>

          <div className="text-xs text-gray-500">
            A videochamada iniciará automaticamente quando outros participantes entrarem
          </div>
          <Button className="w-full mt-4" variant="default" onClick={onJoinRoom}>
            Ingressar na Sala
          </Button>
        </div>

        {/* Loading Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
