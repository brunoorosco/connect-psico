import { X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useChatStore } from "@/infra/stores/useChatStore"

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore()
  const { onlineUsers } = useAuthStore()

  const userOnline = onlineUsers.some((user) => user === selectedUser.userId)

  if (!selectedUser) return null // não renderiza se não houver usuário selecionado

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={selectedUser.image || "/avatar.png"} alt={selectedUser.name} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">{userOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
        {/* Close button */}
        <button
          onClick={() =>
            //@ts-ignore
            setSelectedUser(null)
          }
          className="p-1 hover:bg-neutral-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
