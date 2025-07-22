// app/video-call/[roomId]/page.tsx
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import VideoChat from "@components/videoChat"
import { getVideoCall } from "@/actions/scheduleVideo/getUserVideoPartipitants"

interface Props {
  params: { roomId: string }
}

export default function VideoCallRoomPage({ params }: Props) {
  const { data: session } = useSession()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    getVideoCall(params.roomId).then(setRoom)
    setLoading(false)
  }, [session])

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
