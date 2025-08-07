"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Users, Mic, MicOff, Video, VideoOff, Square, CircleDot, MessageSquare, Settings, PhoneOff } from "lucide-react"

interface HeaderControlsProps {
  roomId: string
  participantCount: number
  isRecording: boolean
  isUploading: boolean
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  audioAvailable: boolean
  videoAvailable: boolean
  btnRecorder: boolean
  formatDuration: () => string
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleRecording: () => void
  onOpenChat: () => void
  onOpenSettings: () => void
  onLeaveCall: () => void
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  roomId,
  participantCount,
  isRecording,
  isUploading,
  isAudioEnabled,
  isVideoEnabled,
  audioAvailable,
  videoAvailable,
  btnRecorder,
  formatDuration,
  onToggleAudio,
  onToggleVideo,
  onToggleRecording,
  onOpenChat,
  onOpenSettings,
  onLeaveCall,
}) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Info sala */}
        <div className="flex items-center flex-wrap gap-4">
          <h1 className="text-xl font-semibold text-white">Sala: {roomId}</h1>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>
              {participantCount} participante{participantCount !== 1 && "s"}
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">REC {formatDuration()}</span>
            </div>
          )}

          {isUploading && <div className="text-sm text-yellow-400">Enviando áudio...</div>}
        </div>

        {/* Controles para desktop apenas */}
        <div className="hidden sm:flex items-center space-x-2 flex-wrap">
          <Button
            variant={!audioAvailable ? "outline" : isAudioEnabled ? "secondary" : "destructive"}
            size="sm"
            onClick={onToggleAudio}
            disabled={!audioAvailable}
            title={
              !audioAvailable ? "Microfone não disponível" : isAudioEnabled ? "Desativar microfone" : "Ativar microfone"
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
            onClick={onToggleVideo}
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

          {btnRecorder && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={onToggleRecording}
              title={isRecording ? "Parar gravação" : "Iniciar gravação"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <CircleDot className="w-4 h-4" />}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onOpenChat}>
            <MessageSquare className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={onOpenSettings}>
            <Settings className="w-4 h-4" />
          </Button>

          <Button variant="destructive" size="sm" onClick={onLeaveCall}>
            <PhoneOff className="w-4 h-4" />
            <span className="ml-2">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
