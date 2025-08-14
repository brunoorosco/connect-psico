import React, { useState } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { MessageCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ProfessionalModel } from "@/domain/model/professional"
import { useSession } from "next-auth/react"
import { sendMessageService } from "@services/messageService"

interface ProfessionalProps {
  professional: ProfessionalModel
}

export const TextMessage: React.FC<ProfessionalProps> = ({ professional }) => {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { data: session, status } = useSession()

  const handleSendMessage = async () => {
    if (!message || message.trim() === "" || !professional) return

    setIsSending(true)
    try {
      const textMessage = {
        senderId: session?.user.id as string,
        text: message.trim(),
        receiverId: professional.userId,
      }
      const result = await sendMessageService(professional.userId, textMessage)

      if (result.error) {
        toast.error("Erro ao enviar mensagem", {
          description: result.error,
        })
        return
      }

      toast.success("Mensagem enviada!", {
        description: `Sua mensagem foi enviada com sucesso!!`,
      })

      setMessage("")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <TabsContent value="message" className="pt-4 space-y-4">
      <h4 className="text-sm font-medium">Envie uma mensagem para {professional.name}:</h4>
      <Textarea
        placeholder="Escreva sua mensagem aqui..."
        className="min-h-[120px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        disabled={isSending}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{message.length}/500 caracteres</p>
        <Button
          className="bg-therapy-primary hover:bg-therapy-tertiary"
          onClick={handleSendMessage}
          disabled={
            !message || message.trim() === "" || status !== "authenticated" || isSending
          }
        >
          {isSending ? (
            <>Enviando...</>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar mensagem
            </>
          )}
        </Button>
      </div>
    </TabsContent>
  )
}
