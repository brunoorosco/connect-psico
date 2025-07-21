"use client"

import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useEffect, useRef, useState } from "react"

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

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMic, setSelectedMic] = useState<string>("")
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    if (!authUser || !socket) return

    const setupListeners = () => {
      setOnOffer(async ({ offer, from }) => {
        if (!localStreamRef.current) return

        pcRef.current = createPeerConnection(from)

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer))

        localStreamRef.current.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, localStreamRef.current!)
        })

        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)

        socket.emit("answer", { to: from, answer })
      })

      setOnAnswer(async ({ answer }) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
      })

      setOnIceCandidate(async ({ candidate }) => {
        try {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          console.error("Erro ao adicionar ICE:", err)
        }
      })
    }

    setupListeners()

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [authUser, socket])

  const requestPermissionAndLoadDevices = async () => {
    try {
      // 1. Solicita permissão genérica (sem deviceId)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setPermissionGranted(true)

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // 2. Agora pode listar com labels corretos
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videos = devices.filter((d) => d.kind === "videoinput")
      const audios = devices.filter((d) => d.kind === "audioinput")

      setVideoDevices(videos)
      setAudioDevices(audios)
      setSelectedCamera(videos[0]?.deviceId || "")
      setSelectedMic(audios[0]?.deviceId || "")
    } catch (err) {
      console.error("❌ Erro ao solicitar permissão:", err)
      alert("Não foi possível acessar câmera/microfone. Verifique as permissões do navegador.")
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
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      pcRef.current = createPeerConnection(remoteUserId)

      stream.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, stream)
      })

      const offer = await pcRef.current.createOffer()
      await pcRef.current.setLocalDescription(offer)

      socket.emit("offer", { to: remoteUserId, offer })
    } catch (err: any) {
      console.error("❌ Erro ao iniciar chamada:", err)
      if (err.name === "OverconstrainedError") {
        alert("O dispositivo selecionado não foi encontrado. Escolha outro microfone/câmera.")
      } else {
        alert("Erro ao iniciar chamada: " + err.message)
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-64 h-48 border rounded bg-black" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 border rounded bg-black" />
      </div>

      {!permissionGranted ? (
        <button
          onClick={requestPermissionAndLoadDevices}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        >
          Permitir Acesso à Câmera e Microfone
        </button>
      ) : (
        <>
          <div className="flex flex-col items-start space-y-2 w-64">
            <label className="text-sm font-medium">Selecionar Câmera:</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              {videoDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Câmera ${device.deviceId}`}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium mt-2">Selecionar Microfone:</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={startCall}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Iniciar Chamada
          </button>
        </>
      )}
    </div>
  )
}
