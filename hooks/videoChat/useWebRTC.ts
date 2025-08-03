"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"

interface Participant {
  userId: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  avatar?: string
  stream?: MediaStream
  userName?: string
}

interface UseWebRTCProps {
  roomId: string
  userId: string
  avatar?: string
  serverUrl?: string
  userName?: string
}

export function useWebRTC({ roomId, userId, userName, avatar, serverUrl = "http://localhost:3001" }: UseWebRTCProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map())
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)

  // Configuração ICE servers (STUN/TURN)
  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  // Inicializar socket
  useEffect(() => {
    const newSocket = io(serverUrl)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Conectado ao servidor Socket.io")
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("Desconectado do servidor Socket.io")
      setIsConnected(false)
    })

    return () => {
      newSocket.close()
    }
  }, [serverUrl])

  // Obter stream local
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setLocalStream(stream)
      localStreamRef.current = stream
      return stream
    } catch (error) {
      console.error("Erro ao obter stream local:", error)
      throw error
    }
  }, [])

  // Criar peer connection
  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const peerConnection = new RTCPeerConnection(iceServers)

      // Adicionar stream local
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!)
        })
      }

      // Lidar com stream remoto
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams
        setParticipants((prev) => {
          const updated = new Map(prev)
          const participant = updated.get(targetUserId)
          if (participant) {
            updated.set(targetUserId, { ...participant, stream: remoteStream })
          }
          return updated
        })
      }

      // Lidar com ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtcSignaling", {
            roomId,
            targetUserId,
            signal: event.candidate,
            type: "ice-candidate",
          })
        }
      }

      peerConnections.current.set(targetUserId, peerConnection)
      return peerConnection
    },
    [roomId, socket]
  )

  // Entrar na sala
  const joinRoom = useCallback(async () => {
    if (!socket) return

    try {
      await getLocalStream()
console.log("username",userName)
      socket.emit("joinRoom", { roomId, userId, avatar, userName})

      // Lidar com novos participantes
      socket.on(
        "participantJoined",
        async ({ userId: newUserId, isAudioEnabled, isVideoEnabled, avatar, userName }) => {
          console.log("Novo participante:", newUserId, userName)

          setParticipants((prev) => {
            const updated = new Map(prev)
            updated.set(newUserId, {
              userId: newUserId,
              isAudioEnabled,
              isVideoEnabled,
              avatar,
              userName,
            })
            return updated
          })

          // Criar oferta para o novo participante
          const peerConnection = createPeerConnection(newUserId)
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)

          socket.emit("webrtcSignaling", {
            roomId,
            targetUserId: newUserId,
            signal: offer,
            type: "offer",
          })
        }
      )

      // Lidar com participantes existentes
      socket.on("roomJoined", ({ participants: existingParticipants }) => {
        setParticipants((prev) => {
          const updated = new Map(prev)
          existingParticipants.forEach((participant: any) => {
            updated.set(participant.userId, participant)
          })
          return updated
        })
      })

      // Lidar com sinalização WebRTC
      socket.on("webrtcSignaling", async ({ fromUserId, signal, type }) => {
        let peerConnection = peerConnections.current.get(fromUserId)

        if (!peerConnection) {
          peerConnection = createPeerConnection(fromUserId)
        }

        try {
          if (type === "offer") {
            await peerConnection.setRemoteDescription(signal)
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            socket.emit("webrtcSignaling", {
              roomId,
              targetUserId: fromUserId,
              signal: answer,
              type: "answer",
            })
          } else if (type === "answer") {
            await peerConnection.setRemoteDescription(signal)
          } else if (type === "ice-candidate") {
            await peerConnection.addIceCandidate(signal)
          }
        } catch (error) {
          console.error("Erro na sinalização WebRTC:", error)
        }
      })

      // Lidar com participantes saindo
      socket.on("participantLeft", ({ userId: leftUserId }) => {
        console.log("Participante saiu:", leftUserId)

        setParticipants((prev) => {
          const updated = new Map(prev)
          updated.delete(leftUserId)
          return updated
        })

        const peerConnection = peerConnections.current.get(leftUserId)
        if (peerConnection) {
          peerConnection.close()
          peerConnections.current.delete(leftUserId)
        }
      })

      // Lidar com status de áudio/vídeo
      socket.on("participantAudioStatus", ({ userId: participantId, isAudioEnabled }) => {
        setParticipants((prev) => {
          const updated = new Map(prev)
          const participant = updated.get(participantId)
          if (participant) {
            updated.set(participantId, { ...participant, isAudioEnabled })
          }
          return updated
        })
      })

      socket.on("participantVideoStatus", ({ userId: participantId, isVideoEnabled }) => {
        setParticipants((prev) => {
          const updated = new Map(prev)
          const participant = updated.get(participantId)
          if (participant) {
            updated.set(participantId, { ...participant, isVideoEnabled })
          }
          return updated
        })
      })
    } catch (error) {
      console.error("Erro ao entrar na sala:", error)
    }
  }, [socket, roomId, userId, avatar, getLocalStream, createPeerConnection])

  // Controlar áudio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)

        if (socket) {
          socket.emit("toggleAudio", { roomId, isEnabled: audioTrack.enabled })
        }
      }
    }
  }, [socket, roomId])

  // Controlar vídeo
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)

        if (socket) {
          socket.emit("toggleVideo", { roomId, isEnabled: videoTrack.enabled })
        }
      }
    }
  }, [socket, roomId])

  // Sair da sala
  const leaveRoom = useCallback(() => {
    // Emitir evento de saída explícita
    if (socket && roomId && userId) {
      socket.emit("leaveRoom", { roomId, userId })
    }

    // Fechar todas as conexões peer
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()

    // Parar stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Desconectar socket
    if (socket) {
      socket.disconnect()
    }

    setParticipants(new Map())
    setLocalStream(null)
    localStreamRef.current = null
  }, [socket, roomId, userId])

  // Cleanup
  useEffect(() => {
    return () => {
      leaveRoom()
    }
  }, [leaveRoom])

  return {
    socket,
    localStream,
    participants: Array.from(participants.values()),
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    joinRoom,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  }
}
