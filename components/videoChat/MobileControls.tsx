// components/videoChat/MobileControls.tsx

"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, CircleDot, Square, MessageSquare, Settings, PhoneOff } from "lucide-react"

interface MobileControlsProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isRecording: boolean
  audioAvailable: boolean
  videoAvailable: boolean
  btnRecorder: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleRecording: () => void
  onOpenChat: () => void
  onOpenSettings: () => void
  onLeaveCall: () => void
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isRecording,
  btnRecorder,
  audioAvailable,
  videoAvailable,
  onToggleAudio,
  onToggleVideo,
  onToggleRecording,
  onOpenChat,
  onOpenSettings,
  onLeaveCall,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-700 p-2 flex gap-2 justify-center sm:hidden z-50">
      <Button
        variant={!audioAvailable ? "outline" : isAudioEnabled ? "secondary" : "destructive"}
        size="icon"
        onClick={onToggleAudio}
        disabled={!audioAvailable}
      >
        {!audioAvailable ? (
          <MicOff className="w-5 h-5 opacity-50" />
        ) : isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant={!videoAvailable ? "outline" : isVideoEnabled ? "secondary" : "destructive"}
        size="icon"
        onClick={onToggleVideo}
        disabled={!videoAvailable}
      >
        {!videoAvailable ? (
          <VideoOff className="w-5 h-5 opacity-50" />
        ) : isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      {btnRecorder ?? (
        <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={onToggleRecording}>
          {isRecording ? <Square className="w-5 h-5" /> : <CircleDot className="w-5 h-5" />}
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={onOpenChat}>
        <MessageSquare className="w-5 h-5" />
      </Button>

      <Button variant="outline" size="icon" onClick={onOpenSettings}>
        <Settings className="w-5 h-5" />
      </Button>

      <Button variant="destructive" size="icon" onClick={onLeaveCall}>
        <PhoneOff className="w-5 h-5" />
      </Button>
    </div>
  )
}
