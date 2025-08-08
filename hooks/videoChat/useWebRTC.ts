import { useState, useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { MediaDeviceState, Participant, UseWebRTCProps } from "./types"
import { env } from "@/config/application"

export function useWebRTC({ roomId, userId, userName, avatar, serverUrl = env.baseUrlPsicomaisApi }: UseWebRTCProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Separate media device states
  const [mediaState, setMediaState] = useState<MediaDeviceState>({
    audio: { available: false, enabled: false, track: null },
    video: { available: false, enabled: false, track: null },
  })

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)

  // ICE servers configuration
  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  // Check device availability
  const checkDeviceAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasAudio = devices.some((device) => device.kind === "audioinput")
      const hasVideo = devices.some((device) => device.kind === "videoinput")

      console.log("🎤 Audio devices available:", hasAudio)
      console.log("📹 Video devices available:", hasVideo)

      return { hasAudio, hasVideo }
    } catch (error) {
      console.error("Error checking device availability:", error)
      return { hasAudio: false, hasVideo: false }
    }
  }, [])

  // Get audio stream only
  const getAudioStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      // console.log('🎤 Audio stream obtained');
      return stream
    } catch (error) {
      console.error("Error getting audio stream:", error)
      setError("Não foi possível acessar o microfone")
      return null
    }
  }, [])

  // Get video stream only
  const getVideoStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      // console.log('📹 Video stream obtained');
      return stream
    } catch (error) {
      console.error("Error getting video stream:", error)
      setError("Não foi possível acessar a câmera")
      return null
    }
  }, [])

  // Initialize media streams independently
  const initializeMedia = useCallback(async () => {
    try {
      setError(null)
      const { hasAudio, hasVideo } = await checkDeviceAvailability()

      const combinedStream = new MediaStream()
      let audioTrack: MediaStreamTrack | null = null
      let videoTrack: MediaStreamTrack | null = null

      // Try to get audio stream if available
      if (hasAudio) {
        try {
          const audioStream = await getAudioStream()
          if (audioStream) {
            audioTrack = audioStream.getAudioTracks()[0]
            if (audioTrack) {
              combinedStream.addTrack(audioTrack)
              console.log("✅ Audio track added to combined stream")
            }
          }
        } catch (error) {
          console.warn("⚠️ Failed to get audio, continuing without audio:", error)
        }
      }

      // Try to get video stream if available
      if (hasVideo) {
        try {
          const videoStream = await getVideoStream()
          if (videoStream) {
            videoTrack = videoStream.getVideoTracks()[0]
            if (videoTrack) {
              combinedStream.addTrack(videoTrack)
              console.log("✅ Video track added to combined stream")
            }
          }
        } catch (error) {
          console.warn("⚠️ Failed to get video, continuing without video:", error)
        }
      }

      // Update media state
      setMediaState({
        audio: {
          available: hasAudio && audioTrack !== null,
          enabled: hasAudio && audioTrack !== null,
          track: audioTrack,
        },
        video: {
          available: hasVideo && videoTrack !== null,
          enabled: hasVideo && videoTrack !== null,
          track: videoTrack,
        },
      })

      // Set the combined stream
      setLocalStream(combinedStream)
      localStreamRef.current = combinedStream

      console.log("🎯 Media initialization complete:", {
        audioAvailable: hasAudio && audioTrack !== null,
        videoAvailable: hasVideo && videoTrack !== null,
        totalTracks: combinedStream.getTracks().length,
      })

      return combinedStream
    } catch (error) {
      console.error("Error initializing media:", error)
      setError("Erro ao inicializar dispositivos de mídia")

      // Set all as unavailable on error
      setMediaState({
        audio: { available: false, enabled: false, track: null },
        video: { available: false, enabled: false, track: null },
      })

      return null
    }
  }, [checkDeviceAvailability, getAudioStream, getVideoStream])

  // Initialize socket
  useEffect(() => {
    const newSocket = io(serverUrl)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.io server")
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.io server")
      setIsConnected(false)
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
      setError("Erro de conexão com o servidor")
    })

    return () => {
      newSocket.close()
    }
  }, [serverUrl])

  // Create peer connection
  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const peerConnection = new RTCPeerConnection(iceServers)

      // Add local tracks if available
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (localStreamRef.current) {
            peerConnection.addTrack(track, localStreamRef.current)
            console.log(`📡 Added ${track.kind} track to peer connection for ${targetUserId}`)
          }
        })
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams
        console.log(`📥 Received ${event.track.kind} track from ${targetUserId}`)

        setParticipants((prev) => {
          const updated = new Map(prev)
          const participant = updated.get(targetUserId)
          if (participant) {
            updated.set(targetUserId, { ...participant, stream: remoteStream })
          }
          return updated
        })
      }

      // Handle ICE candidates
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

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔗 Connection state with ${targetUserId}:`, peerConnection.connectionState)
      }

      peerConnections.current.set(targetUserId, peerConnection)
      return peerConnection
    },
    [roomId, socket]
  )

  // Join room
  const joinRoom = useCallback(async () => {
    if (!socket) {
      console.warn("⚠️ Socket not available, cannot join room")
      return
    }

    try {
      console.log("🚪 Joining room:", roomId)

      // Initialize media first
      await initializeMedia()

      socket.emit("joinRoom", { roomId, userName, userId, avatar })

      // Handle new participants
      socket.on(
        "participantJoined",
        async ({ userId: newUserId, userName, isAudioEnabled, isVideoEnabled, avatar }) => {
          console.log("👤 New participant joined:", newUserId)
          console.log("user", userName)
          setParticipants((prev) => {
            const updated = new Map(prev)
            updated.set(newUserId, {
              userId: newUserId,
              userName,
              isAudioEnabled,
              isVideoEnabled,
              avatar,
            })
            return updated
          })

          // Create offer for new participant
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

      // Handle existing participants
      socket.on("roomJoined", ({ participants: existingParticipants }) => {
        console.log("👥 Existing participants:", existingParticipants.length)

        setParticipants((prev) => {
          const updated = new Map(prev)

          existingParticipants.forEach((participant: any) => {
            const { userId, userName, avatar, isAudioEnabled, isVideoEnabled } = participant

            updated.set(userId, {
              userId,
              userName,
              avatar,
              isAudioEnabled,
              isVideoEnabled,
            })
          })

          return updated
        })
      })

      // Handle WebRTC signaling
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
          console.error("❌ WebRTC signaling error:", error)
        }
      })

      // Handle participants leaving
      socket.on("participantLeft", ({ userId: leftUserId }) => {
        // console.log('👋 Participant left:', leftUserId);

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

      // Handle audio/video status updates
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
      console.error("❌ Error joining room:", error)
      setError("Erro ao entrar na sala")
    }
  }, [socket, roomId, userId, avatar, initializeMedia, createPeerConnection])

  // Toggle audio independently
  const toggleAudio = useCallback(() => {
    const audioTrack = mediaState.audio.track

    if (!mediaState.audio.available) {
      console.warn("⚠️ Audio not available")
      setError("Microfone não disponível")
      return
    }

    if (audioTrack) {
      const newEnabled = !mediaState.audio.enabled
      audioTrack.enabled = newEnabled

      setMediaState((prev) => ({
        ...prev,
        audio: { ...prev.audio, enabled: newEnabled },
      }))

      if (socket) {
        socket.emit("toggleAudio", { roomId, isEnabled: newEnabled })
      }

      console.log(`🎤 Audio ${newEnabled ? "enabled" : "disabled"}`)
    } else {
      console.warn("⚠️ No audio track available")
      setError("Track de áudio não encontrado")
    }
  }, [mediaState.audio, socket, roomId])

  // Toggle video independently
  const toggleVideo = useCallback(() => {
    const videoTrack = mediaState.video.track

    if (!mediaState.video.available) {
      console.warn("⚠️ Video not available")
      setError("Câmera não disponível")
      return
    }

    if (videoTrack) {
      const newEnabled = !mediaState.video.enabled
      videoTrack.enabled = newEnabled

      setMediaState((prev) => ({
        ...prev,
        video: { ...prev.video, enabled: newEnabled },
      }))

      if (socket) {
        socket.emit("toggleVideo", { roomId, isEnabled: newEnabled })
      }

      console.log(`📹 Video ${newEnabled ? "enabled" : "disabled"}`)
    } else {
      console.warn("⚠️ No video track available")
      setError("Track de vídeo não encontrado")
    }
  }, [mediaState.video, socket, roomId])

  // Leave room
  const leaveRoom = useCallback(() => {
    console.log("🚪 Leaving room:", roomId)

    // Emit explicit leave event
    if (socket && roomId && userId) {
      socket.emit("leaveRoom", { roomId, userId })
    }

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log(`🛑 Stopped ${track.kind} track`)
      })
    }

    // Reset states
    setParticipants(new Map())
    setLocalStream(null)
    setMediaState({
      audio: { available: false, enabled: false, track: null },
      video: { available: false, enabled: false, track: null },
    })
    localStreamRef.current = null
    setError(null)
  }, [socket, roomId, userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom()
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return {
    socket,
    localStream,
    participants: Array.from(participants.values()),
    isAudioEnabled: mediaState.audio.enabled,
    isVideoEnabled: mediaState.video.enabled,
    audioAvailable: mediaState.audio.available,
    videoAvailable: mediaState.video.available,
    isConnected,
    error,
    joinRoom,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  }
}
