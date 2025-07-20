// app/room/[id]/VideoChatWrapper.tsx (client component)
"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useSession } from "next-auth/react"

const VideoChat = dynamic(() => import("@/components/videoChat"), { ssr: false })

export default function VideoChatWrapper() {
  const params = useParams()
  const id = params.id as string
  const setAuthUser = useAuthStore((s) => s.setAuthUser)
  const connectSocket = useAuthStore((s) => s.connectSocket)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      setAuthUser({
        id: session.user.id,
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      })
      connectSocket()
    }
  }, [session, setAuthUser])

  if (!id) return <div>Carregando sala...</div>

  return <VideoChat remoteUserId={id} />
}
