"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import VideoChat from "@components/videoChat"
import { getVideoCall } from "@/actions/scheduleVideo/getUserVideoPartipitants"
import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useCallStore } from "@/infra/stores/useCallStore"

interface Props {
  params: { roomId: string }
}

export default function VideoCallRoomPage({ params }: Props) {
  const { data: session } = useSession()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const setAuthUser = useAuthStore((s) => s.setAuthUser)
  const connectSocket = useAuthStore((s) => s.connectSocket)
  const setMinimized = useCallStore((s) => s.setMinimized)
  const setMeta = useCallStore((s) => s.setMeta)

  useEffect(() => {
    if (!session?.user?.id) return

    setAuthUser({
      id: session.user.id,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    })
    connectSocket()

    const loadRoom = async () => {
      const res = await getVideoCall(params.roomId)
      if (res) {
        setRoom(res)
      } else {
        setTimeout(() => setNotFound(true), 10000) // exibe "sala não encontrada" só após 10s
      }
      setLoading(false)
    }

    loadRoom()
    setMinimized(false)
    setMeta({ roomId: params.roomId })
  }, [session, setAuthUser, params.roomId, setMinimized, setMeta, connectSocket])

  useEffect(() => {
    return () => {
      if (useCallStore.getState().inCall) {
        setMinimized(true)
      }
    }
  }, [setMinimized])

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen animate-pulse">
        <main className="flex-1 bg-black relative" />
        <aside className="w-full md:w-64 bg-zinc-900 p-4 space-y-4">
          <div className="h-6 bg-zinc-700 rounded w-3/4" />
          <div className="h-4 bg-zinc-700 rounded w-1/2" />
          <div className="space-y-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-700 rounded-full" />
                <div className="h-4 bg-zinc-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    )
  }

  if (!room && notFound) return <div className="text-center mt-10 text-white">Sala não encontrada</div>

  const currentUserId = session?.user?.id
  const remoteUser = room?.participants?.find((p: any) => p.user.id !== currentUserId)
  const remoteUserId = remoteUser?.user.id

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <main className="flex-1 bg-black relative">
        <VideoChat remoteUserId={remoteUserId ?? ""} isScheduledCall />
      </main>
      <aside className="w-full md:w-64 bg-zinc-900 text-white p-4 flex-shrink-0 overflow-y-auto">
        <h1 className="text-lg font-semibold">Consulta Remota</h1>
        <p className="text-sm mt-1">
          Agendada para: {new Date(room.scheduledAt).toLocaleString()}
        </p>
        <div className="mt-4">
          <h2 className="font-medium mb-2">Participantes</h2>
          <ul className="space-y-2">
            {room.participants.map((p: any) => (
              <li key={p.user.id} className="flex items-center gap-2">
                <img
                  src={p.user.image || "/default-avatar.png"}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">
                  {p.user.name} {p.user.id === currentUserId && "(você)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
