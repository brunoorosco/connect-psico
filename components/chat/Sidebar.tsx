"use client"

import { useEffect, useMemo, useState } from "react"
import SidebarSkeleton from "./SidebarSkeleton"
import { AlertCircle, Users } from "lucide-react"
import { UserChat } from "@/domain/model/patient"
import { useAuthStore } from "@/infra/stores/useAuthStore"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { getInitials } from "@/utils/getInitialsName"

const SidebarChat = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { onlineUsers } = useAuthStore()

  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (currentUser?.id) {
      // carregamos os usuários do chat para o usuário atual
      getUsers(currentUser)
    }
  }, [currentUser?.id])

  const errorMessage = useMemo(() => {
    if (isUsersLoading) return null
    if (Array.isArray(users)) return null
    // tenta extrair uma mensagem vinda da store/req, senão usa uma padrão
    return (users as any)?.error || "Falha ao carregar contatos. Tente novamente."
  }, [users, isUsersLoading])

  // Garante que trabalharemos sempre com um array para renderização
  const safeUsers: UserChat[] = useMemo(() => {
    return Array.isArray(users) ? users : []
  }, [users])

  const filteredUsers = useMemo(() => {
    if (showOnlineOnly) {
      return safeUsers.filter((u: UserChat) => onlineUsers.includes(u.userId))
    }
    return safeUsers
  }, [safeUsers, showOnlineOnly, onlineUsers])

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    // aside atual: substitua por
    <aside className="h-full w-full lg:max-w-[16rem] xl:max-w-[18rem] xl:w-[20rem] border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 w-full p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contatos</span>
          </div>

          {!errorMessage && (
            <label className="hidden lg:inline-flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
              />
              <span>Online</span>
            </label>
          )}
        </div>
      </div>

      {/* Banner de erro dentro do sidebar, sem dar return */}
      {errorMessage && (
        <div className="px-4 pt-3">
          <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex flex-col gap-2">
            {/* Linha com ícone e título */}
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">Não foi possível carregar os contatos</span>
            </div>

            {/* Mensagem e botão */}
            <div className=" items-center justify-between">
              <p className="text-red-600/90 text-sm">{errorMessage}</p>
              <button
                type="button"
                className="text-xs font-medium text-red-700 hover:text-red-800 underline disabled:opacity-50"
                disabled={isUsersLoading}
                onClick={() => {
                  if (currentUser?.id) getUsers(currentUser)
                }}
              >
                {isUsersLoading ? "Carregando..." : "Tentar novamente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((u: UserChat) => {
          const isSelected = selectedUser?.userId === u.userId
          const isOnline = onlineUsers.includes(u.userId)

          return (
            <button
              key={u.userId}
              onClick={() => setSelectedUser(u)}
              className={`
                w-full p-3 flex items-center gap-3
                ${isSelected ? "bg-gray-200" : "hover:bg-primary"}
                transition-colors rounded-md
              `}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={u.image || ""} />
                  <AvatarFallback className="bg-primary text-white">{getInitials(u.name || "")}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-sm text-zinc-400">{isOnline ? "Online" : "Offline"}</div>
              </div>
            </button>
          )
        })}

        {filteredUsers.length === 0 && !errorMessage && (
          <div className="text-center text-zinc-500 py-4">Nenhuma conversa encontrada</div>
        )}
      </div>
    </aside>
  )
}

export default SidebarChat
