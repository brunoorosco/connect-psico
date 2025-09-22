"use client"

import { X, ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { useChatStore } from "@/infra/stores/useChatStore"
import { getInitials } from "@/utils/getInitialsName"

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore()

  return (
    <div className="sticky top-0 z-10 bg-base-100 p-2.5 border-b border-base-300">
      <div className="flex items-center gap-3">
        {/* VOLTAR: só no mobile */}
        <button
          className="lg:hidden inline-flex p-2 rounded hover:bg-base-200"
          onClick={() => setSelectedUser(null)}
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Avatar + nome do contato selecionado */}
        {!!selectedUser && (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar>
              <AvatarImage src={selectedUser.image || ""} />
              <AvatarFallback className="bg-therapy-primary text-white">
                {getInitials(selectedUser.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {selectedUser.name || "Contato"}
              </div>
              {/* Subtítulo opcional: status/último visto/etc */}
              {/* <div className="text-xs text-zinc-500">Online</div> */}
            </div>
        </div>
        )}

        {/* Fechar conversa (opcional no desktop) */}
        {!!selectedUser && (
          <button
            className="ml-auto hidden lg:inline-flex p-2 rounded hover:bg-base-200"
            onClick={() => setSelectedUser(null)}
            aria-label="Fechar conversa"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatHeader
