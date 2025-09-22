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

// IMPORTANTE: vamos mostrar o chat quando tiver seleção
import ChatHeader from "./ChatHeader"
import ChatContainer from "./ChatContainer"

const SidebarMobile = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (currentUser?.id) getUsers(currentUser)
  }, [currentUser?.id])

  const errorMessage = useMemo(() => {
    if (isUsersLoading) return null
    if (Array.isArray(users)) return null
    return (users as any)?.error || "Falha ao carregar contatos. Tente novamente."
  }, [users, isUsersLoading])

  const safeUsers: UserChat[] = useMemo(
    () => (Array.isArray(users) ? users : []),
    [users]
  )

  const filteredUsers = useMemo(() => {
    if (showOnlineOnly) {
      return safeUsers.filter((u: UserChat) => onlineUsers.includes(u.userId))
    }
    return safeUsers
  }, [safeUsers, showOnlineOnly, onlineUsers])

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <div className="h-dvh w-dvw"> 
      <div className="flex h-full">
        {/* COLUNA LISTA (mobile: some quando há selectedUser; desktop: sempre visível) */}
        <aside
          className={`${selectedUser ? "hidden lg:block" : "block"} w-full lg:max-w-[18rem] xl:w-[20rem] border-r border-base-300 flex flex-col transition-all duration-200`}
        >
          {/* Cabeçalho da lista */}
          <div className="border-b border-gray-200 w-full p-4">
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

          {/* Erro inline */}
          {errorMessage && (
            <div className="px-4 pt-3">
              <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Não foi possível carregar os contatos</span>
                </div>
                <div>
                  <p className="text-red-600/90 text-sm">{errorMessage}</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-red-700 hover:text-red-800 underline disabled:opacity-50"
                    disabled={isUsersLoading}
                    onClick={() => currentUser?.id && getUsers(currentUser)}
                  >
                    {isUsersLoading ? "Carregando..." : "Tentar novamente"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de conversas – MOBILE FIRST */}
          <div className="overflow-y-auto w-full py-2">
            {filteredUsers.map((u: UserChat) => {
              const isSelected = selectedUser?.userId === u.userId
              const isOnline = onlineUsers.includes(u.userId)

              const lastMessageText =
                (u as any)?.lastMessage?.content ??
                (u as any)?.lastMessage?.text ??
                (u as any)?.lastMessage ??
                "Sem mensagens ainda"

              return (
                <button
                  key={u.userId}
                  onClick={() => setSelectedUser(u)}
                  className={[
                    "w-full px-4 py-3 flex items-center gap-3",
                    "transition-colors",
                    isSelected ? "bg-gray-200" : "hover:bg-[#9b87f555]",
                  ].join(" ")}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={u.image || ""} />
                      <AvatarFallback className="bg-therapy-primary text-white">
                        {getInitials(u.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{u.name || "Contato"}</div>
                      {/* timestamp opcional */}
                      {/* <div className="ml-auto hidden sm:block text-xs text-zinc-400">10:42</div> */}
                    </div>
                    <div className="text-sm text-zinc-500 truncate">
                      {isOnline? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              )
            })}

            {filteredUsers.length === 0 && !errorMessage && (
              <div className="text-center text-zinc-500 py-4">Nenhuma conversa encontrada</div>
            )}
          </div>
        </aside>

        {/* COLUNA CHAT (mobile: aparece quando há selectedUser; desktop: sempre aparece como área principal) */}
        <section className={`${selectedUser ? "flex" : "hidden"} lg:flex flex-1 min-w-0`}>
          {/* IMPORTANTE: ChatContainer já deve ter header e input “grudados”.
              Se o teu ChatContainer NÃO renderiza o header e o input,
              descomenta o bloco manual abaixo. */}
          
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Se teu ChatContainer já contém header+input, pode usar direto: */}
            <ChatContainer />

            {/* ---- Alternativa manual caso você prefira montar aqui: ----
            <ChatHeader />
            <div className="flex-1 overflow-y-auto">
              // ...lista de mensagens...
            </div>
            <MessageInput />
            -------------------------------------------------------------- */}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SidebarMobile
