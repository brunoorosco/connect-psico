"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import ChatContainer from "@components/chat/ChatContainer"
import Sidebar from "@components/chat/Sidebar"
import NoChatSelected from "@components/chat/NoChatSelected"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useAuthStore } from "@/infra/stores/useAuthStore"

const HomePage = () => {
  const { selectedUser } = useChatStore()
  const { data: session } = useSession()
  const setAuthUser = useAuthStore((s) => s.setAuthUser)
  const connectSocket = useAuthStore((s) => s.connectSocket)

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

  return (
    <div className="h-screen">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser?.userId ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomePage
