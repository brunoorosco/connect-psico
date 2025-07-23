"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import VideoChat from "@components/videoChat"
import { getVideoCall } from "@/actions/scheduleVideo/getUserVideoPartipitants"
import { useAuthStore } from "@/infra/stores/useAuthStore"

interface Props {
  params: { roomId: string }
}

export default function VideoCallRoomPage({ params }: Props) {
  const { data: session } = useSession()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const setAuthUser = useAuthStore((s) => s.setAuthUser)
  const connectSocket = useAuthStore((s) => s.connectSocket)

  // useEffect(() => {
  //   if (!session?.user?.id) return
  //   getVideoCall(params.roomId).then(setRoom)
  //   setLoading(false)
  // }, [session])

  useEffect(() => {
    if (!session?.user?.id) return
    setAuthUser({
      id: session.user.id,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    })
    connectSocket()
    getVideoCall(params.roomId).then(setRoom)
    setLoading(false)
  }, [session, setAuthUser])

  if (loading) return <div>Carregando...</div>
  if (!room) return <div>Sala não encontrada</div>

  const currentUserId = session?.user?.id
  const remoteUser = room.participants.find((p: any) => p.user.id !== currentUserId)
  const remoteUserId = remoteUser?.user.id

  return (
    <div>
      <h1 className="text-xl font-bold">Consulta Remoto</h1>
      <p>Agendada para: {new Date(room.scheduledAt).toLocaleString()}</p>
      <h2 className="mt-4">Participantes:</h2>
      <ul>
        {room.participants.map((p: any) => (
          <li key={p.user.id}>
            {p.user.name} {p.user.id === currentUserId && "(você)"}
          </li>
        ))}
      </ul>
      <VideoChat remoteUserId={remoteUserId ?? ""} isScheduledCall />
    </div>
  )
}
