"use client"
import { useEffect, useState } from "react"

import SidebarSkeleton from "./SidebarSkeleton"
import { Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { UserChat } from "@/domain/model/patient"
import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useChatStore } from "@/infra/stores/useChatStore"

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()

  const { onlineUsers } = useAuthStore()
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.user?.id) {
      getUsers(session.user)
    }
  }, [])

  const filteredUsers = showOnlineOnly ? users.filter((user: UserChat) => onlineUsers.includes(user.userId)) : users

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside className="h-fullmax-w-[16rem] xl:max-w-[18rem] xl:w-[20rem] border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-200 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contatos</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user: UserChat) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?.id === user.id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                className="w-12 h-12 rounded-full"
                src={typeof user.image === "string" ? user.image : "/avatar.png"}
                alt={user.name}
              />
              {onlineUsers.includes(user.userId) && (
                <span className="top-0 left-9 absolute  w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-zinc-400">{onlineUsers.includes(user.userId) ? "Online" : "Offline"}</div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && <div className="text-center text-zinc-500 py-4">No online users</div>}
      </div>
    </aside>
  )
}
export default Sidebar
