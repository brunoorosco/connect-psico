import { Socket } from "socket.io-client"

export type Participant = {
  userId: string
  userName?: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  avatar?: string
  stream?: MediaStream
}

export type UseWebRTCProps = {
  roomId: string
  userId: string
  avatar?: string
  serverUrl?: string
}

export type MediaDeviceState = {
  audio: {
    available: boolean
    enabled: boolean
    track: MediaStreamTrack | null
  }
  video: {
    available: boolean
    enabled: boolean
    track: MediaStreamTrack | null
  }
}

export type ChatMessage = {
  id: string
  userId: string
  message: string
  timestamp: Date
  avatar?: string
  userName?: string
}

export type UseChatProps = {
  socket: Socket | null
  roomId: string
  userId: string
  userName?: string
  avatar?: string
}
