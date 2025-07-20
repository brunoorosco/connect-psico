"use client"

import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useEffect, useRef } from "react"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

interface Props {
  remoteUserId: string
}

export default function VideoChat({ remoteUserId }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const socket = useAuthStore((s) => s.socket)
  const authUser = useAuthStore((s) => s.authUser)
  const setOnOffer = useAuthStore((s) => s.setOnOffer)
  const setOnAnswer = useAuthStore((s) => s.setOnAnswer)
  const setOnIceCandidate = useAuthStore((s) => s.setOnIceCandidate)

  useEffect(() => {
    if (!authUser || !socket) return
    console.log("aquiiii")

    let isMounted = true

    const setupMediaAndListeners = async () => {
      try {
        console.log("🔒 Solicitando permissão de mídia...")
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        if (!isMounted) return

        console.log("📷 Mídia local ativa")
        localStreamRef.current = stream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        setOnOffer(async ({ offer, from }) => {
          console.log("📩 OFFER recebido de", from)
          pcRef.current = createPeerConnection(from)

          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer))

          stream.getTracks().forEach((track) => {
            pcRef.current?.addTrack(track, stream)
          })

          const answer = await pcRef.current.createAnswer()
          await pcRef.current.setLocalDescription(answer)

          socket.emit("answer", { to: from, answer })
        })

        setOnAnswer(async ({ answer }) => {
          console.log("📨 ANSWER recebido")
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
        })

        setOnIceCandidate(async ({ candidate }) => {
          console.log("🧊 ICE recebido")
          try {
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.error("Erro ao adicionar ICE:", err)
          }
        })
      } catch (err) {
        console.error("❌ Erro ao acessar mídia:", err)
        alert("Erro ao acessar a câmera e o microfone. Verifique as permissões.")
      }
    }

    setupMediaAndListeners()

    return () => {
      isMounted = false
      // Optionally stop media tracks
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [authUser, socket])

  const createPeerConnection = (targetUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📤 Enviando ICE para", targetUserId)
        socket?.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      console.log("📺 Vídeo remoto recebido")
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    return pc
  }

  const startCall = async () => {
    console.log("📞 Iniciando chamada com", remoteUserId)
    console.log("authUser", authUser)
    console.log("localStreamRef", localStreamRef)
    console.log("socket", socket)

    if (!remoteUserId || !authUser || !socket || !localStreamRef.current) {
      console.warn("🔌 Sem dados suficientes para iniciar a chamada")
      return
    }

    pcRef.current = createPeerConnection(remoteUserId)

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current!)
    })

    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)

    socket.emit("offer", { to: remoteUserId, offer })
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-64 h-48 border rounded bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 border rounded bg-black" />
      </div>
      <button
        onClick={startCall}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
      >
        Iniciar Chamada
      </button>
    </div>
  )
}
