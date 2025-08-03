'use client'

import React, { useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

interface VideoParticipantProps {
  userId: string
  stream?: MediaStream
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  avatar?: string
  isLocal?: boolean
  name?: string
}

export function VideoParticipant({
  userId,
  stream,
  isAudioEnabled,
  isVideoEnabled,
  avatar,
  isLocal = false,
  name,
}: VideoParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream && isVideoEnabled) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isVideoEnabled])

  const displayName = name || `Usuário ${userId.slice(0, 8)}`
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Vídeo ou avatar */}
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <Avatar className="w-28 h-[109px] sm:w-40 sm:h-[173px]">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="text-lg sm:text-2xl font-semibold text-white bg-transparent">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Informações do participante */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs sm:text-sm font-medium truncate">
            {displayName} {isLocal && '(Você)'}
          </span>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Microfone */}
            <div
              className={`p-0.5 sm:p-1 rounded-full ${
                isAudioEnabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <MicOff className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </div>

            {/* Vídeo */}
            <div
              className={`p-0.5 sm:p-1 rounded-full ${
                isVideoEnabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <VideoOff className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de fala */}
      {isAudioEnabled && (
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}
