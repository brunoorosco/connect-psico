"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/infra/stores/useAuthStore"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}
type OfferPayload = {
  offer: RTCSessionDescriptionInit
  from: string
}

type AnswerPayload = {
  answer: RTCSessionDescriptionInit
}

type IceCandidatePayload = {
  candidate: RTCIceCandidateInit
}

export const useWebRTC = (remoteUserId: string) => {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMic, setSelectedMic] = useState<string>("")
  const [inCall, setInCall] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const localStreamRef = useRef<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const remoteUserIdRef = useRef(remoteUserId)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const socket = useAuthStore((s) => s.socket)
  const authUser = useAuthStore((s) => s.authUser)
  const setOnOffer = useAuthStore((s) => s.setOnOffer)
  const setOnAnswer = useAuthStore((s) => s.setOnAnswer)
  const setOnIceCandidate = useAuthStore((s) => s.setOnIceCandidate)

  useEffect(() => {
    remoteUserIdRef.current = remoteUserId
  }, [remoteUserId])

  useEffect(() => {
    const granted = localStorage.getItem("webrtc-permission") === "granted"
    if (granted) {
      requestPermissionAndLoadDevices()
      setConsentGiven(true)
    }

    const cleanup = () => leaveCall()
    window.addEventListener("beforeunload", cleanup)
    return () => window.removeEventListener("beforeunload", cleanup)
  }, [])

  useEffect(() => {
    if (!authUser || !socket) return

    const handleOffer = async ({ offer, from }: OfferPayload) => {
      if (!localStreamRef.current) return
      const pc = createPeerConnection(from)
      pcRef.current = pc
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit("answer", { to: from, answer })
      setInCall(true)
    }

    const handleAnswer = async ({ answer }: AnswerPayload) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
    }

    const handleIceCandidate = async ({ candidate }: IceCandidatePayload) => {
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
    }

    setOnOffer(handleOffer)
    setOnAnswer(handleAnswer)
    setOnIceCandidate(handleIceCandidate)

    return () => {
      setOnOffer((data: OfferPayload) => handleOffer(data))
      setOnAnswer((data: AnswerPayload) => handleAnswer(data))
      setOnIceCandidate((data: IceCandidatePayload) => handleIceCandidate(data))
    }
  }, [authUser, socket])

  const requestPermissionAndLoadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videos = devices.filter((d) => d.kind === "videoinput")
      const audios = devices.filter((d) => d.kind === "audioinput")

      setVideoDevices(videos)
      setAudioDevices(audios)
      setSelectedCamera(videos[0]?.deviceId || "")
      setSelectedMic(audios[0]?.deviceId || "")

      const constraints: MediaStreamConstraints = {
        video: videos.length > 0,
        audio: audios.length > 0,
      }

      if (!constraints.video && !constraints.audio) {
        console.warn("Nenhum dispositivo de entrada encontrado.")
        setPermissionGranted(true)
        localStorage.setItem("webrtc-permission", "granted")
        setConsentGiven(true)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      setPermissionGranted(true)
      localStorage.setItem("webrtc-permission", "granted")
      setConsentGiven(true)
    } catch (err) {
      console.error("Erro ao solicitar permissão de mídia:", err)
      setPermissionGranted(false)
    }
  }

  const createPeerConnection = (targetUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
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

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (["disconnected", "failed", "closed"].includes(state)) {
        console.warn("ICE connection finalizada:", state)
        leaveCall()
      }
    }

    return pc
  }

  const startCall = async () => {
    if (!remoteUserIdRef.current) {
      console.warn("remoteUserId não definido.")
      return
    }

    const constraints: MediaStreamConstraints = {
      video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
      audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    const pc = createPeerConnection(remoteUserIdRef.current)
    pcRef.current = pc
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    socket?.emit("offer", {
      to: remoteUserIdRef.current,
      offer,
    })

    socket?.emit("call-status-updated", {
      to: remoteUserIdRef.current,
      inCall: true,
    })

    setInCall(true)
  }

  const leaveCall = () => {
    console.log("leave-call")

    socket?.emit("leave-call", {
      to: remoteUserIdRef.current,
    })

    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    pcRef.current?.close()
    pcRef.current = null

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    setInCall(false)
  }

  const joinRoom = requestPermissionAndLoadDevices

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
    inCall,
    socket,
  }
}
