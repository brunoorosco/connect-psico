"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/infra/stores/useAuthStore"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export const useWebRTC = (remoteUserId: string) => {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMic, setSelectedMic] = useState<string>("")
  const [inCall, setInCall] = useState(false)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const socket = useAuthStore((s) => s.socket)
  const authUser = useAuthStore((s) => s.authUser)
  const setOnOffer = useAuthStore((s) => s.setOnOffer)
  const setOnAnswer = useAuthStore((s) => s.setOnAnswer)
  const setOnIceCandidate = useAuthStore((s) => s.setOnIceCandidate)

  const [consentGiven, setConsentGiven] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  // 🚀 Checa permissão já concedida no load
  useEffect(() => {
    const granted = localStorage.getItem("webrtc-permission") === "granted"
    if (granted) {
      requestPermissionAndLoadDevices()
      setConsentGiven(true)
    }
  }, [])

  useEffect(() => {
    if (!authUser || !socket) return

    setOnOffer(async ({ offer, from }) => {
      if (!localStreamRef.current) return
      pcRef.current = createPeerConnection(from)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer))
      localStreamRef.current.getTracks().forEach((track) => pcRef.current?.addTrack(track, localStreamRef.current!))
      const answer = await pcRef.current.createAnswer()
      await pcRef.current.setLocalDescription(answer)
      socket.emit("answer", { to: from, answer })
      setInCall(true)
    })

    setOnAnswer(async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
    })

    setOnIceCandidate(async ({ candidate }) => {
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
    })
  }, [authUser, socket])

  const toggleMic = () => {
    const audioTracks = localStreamRef.current?.getAudioTracks()
    if (audioTracks?.length) {
      const enabled = !micEnabled
      audioTracks.forEach((track) => (track.enabled = enabled))
      setMicEnabled(enabled)
    }
  }

  const toggleCamera = () => {
    const videoTracks = localStreamRef.current?.getVideoTracks()
    if (videoTracks?.length) {
      const enabled = !cameraEnabled
      videoTracks.forEach((track) => (track.enabled = enabled))
      setCameraEnabled(enabled)
    }
  }

  const requestPermissionAndLoadDevices = async () => {
    try {
      console.log("requestPermissionAndLoadDevices")
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      setPermissionGranted(true)
      localStorage.setItem("webrtc-permission", "granted") // ✅ salva no localStorage
      setConsentGiven(true)
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videos = devices.filter((d) => d.kind === "videoinput")
      const audios = devices.filter((d) => d.kind === "audioinput")

      setVideoDevices(videos)
      setAudioDevices(audios)
      setSelectedCamera(videos[0]?.deviceId || "")
      setSelectedMic(audios[0]?.deviceId || "")
    } catch (err) {
      console.error("Permissão de mídia negada:", err)
      setPermissionGranted(false)
    }
  }

  const createPeerConnection = (targetUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    return pc
  }

  const startCall = async () => {
    const constraints: MediaStreamConstraints = {
      video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
      audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    pcRef.current = createPeerConnection(remoteUserId)
    stream.getTracks().forEach((track) => pcRef.current?.addTrack(track, stream))

    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)
    socket?.emit("offer", { to: remoteUserId, offer })
  }

  const leaveCall = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    pcRef.current?.close()
    pcRef.current = null
    setInCall(false)
    // Pode emitir evento de saída se necessário
  }

  const joinRoom = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    setInCall(true) // Está pronto, aguardando ligação de outro
  }

  return {
    leaveCall,
    joinRoom,
    localVideoRef,
    remoteVideoRef,
    permissionGranted,
    requestPermissionAndLoadDevices,
    startCall,
    videoDevices,
    audioDevices,
    selectedCamera,
    selectedMic,
    setSelectedCamera,
    setSelectedMic,
    toggleMic,
    toggleCamera,
    micEnabled,
    cameraEnabled,
  }
}
