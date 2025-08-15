"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { formatMessageTime } from "@/utils/formatMessageTime"
import { useChatStore } from "@/infra/stores/useChatStore"
import { useCurrentUser } from "@hooks/use-current-user"
import { Patient } from "@/types/appointment"
import ChatFooter from "./PatientList/chatFooter"

interface IMessageDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDialog({ patient, open, onOpenChange }: IMessageDialogProps) {
  const { messages } = useChatStore()
  const user = useCurrentUser()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem</DialogTitle>
          <DialogDescription>Enviar mensagem para {patient?.name}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-md p-4 space-y-4 bg-muted">
          {messages &&
            messages
              .filter((msg) => msg.receiverId === patient?.userId || msg.senderId === patient?.userId)
              .map((msg) => {
                const isCurrentUser = msg.senderId === user?.id
                return (
                  <div key={msg._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className="bg-white p-2 rounded-md shadow-sm max-w-[70%]">
                      <p className="text-sm">{msg.text}</p>
                      <time className="block text-xs text-muted-foreground mt-1">
                        {formatMessageTime(msg.createdAt)}
                      </time>
                    </div>
                  </div>
                )
              })}
        </div>

        <div className="pt-4 space-y-2">
          <ChatFooter receiverId={patient?.userId as string} />
          <DialogFooter />
        </div>
      </DialogContent>
    </Dialog>
  )
}
