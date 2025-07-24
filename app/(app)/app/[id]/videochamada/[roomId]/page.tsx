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

  // const remoteUser = useMemo(() => {
  //   return room.participants.find((p: any) => p.user.id !== currentUserId)
  // }, [room.participants, currentUserId])
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white p-4 flex-shrink-0 overflow-y-auto">
        <h1 className="text-lg font-semibold">Consulta Remota</h1>
        <p className="text-sm mt-1">Agendada para: {new Date(room.scheduledAt).toLocaleString()}</p>
        <div className="mt-4">
          <h2 className="font-medium mb-2">Participantes</h2>
          <ul className="space-y-2">
            {room.participants.map((p: any) => (
              <li key={p.user.id} className="flex items-center gap-2">
                <img src={p.user.image || "/default-avatar.png"} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-sm">
                  {p.user.name} {p.user.id === currentUserId && "(você)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Área de vídeo */}
      <main className="flex-1 bg-black relative">
        <VideoChat remoteUserId={remoteUserId ?? ""} isScheduledCall />
      </main>
    </div>
  )
}
