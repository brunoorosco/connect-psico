"use server"
import { createMessage, sendMessageApi } from "@/actions/messages"
import { getProfessionalById } from "@/actions/users"
import { axiosInstanceChatz } from "@/infra/httpClient/chatzMessageApi"

type TCreateMessage = {
  senderId: string
  receiverId: string
  content: string
}

export async function createMessageService(data: TCreateMessage) {
  const response = await createMessage(data)
  return response
}

export async function sendMessageService(receiverId: string, messageData: Record<string, any>) {
  try {
    const user = await getProfessionalById(receiverId)
    if (user) {
      const result = await sendMessageApi(receiverId, messageData)
      const userName = user.name.split(" ")[0]
      const phoneNumber = user.phone?.replace(/\D/g, "")
      await axiosInstanceChatz.post("/messages/send", {
        body: `*PsicoMais:*\nOi ${userName} você tem notificação de mensagem na plataforma, acesso o link: https://psicomais.com/app`,
        number: "55" + phoneNumber,
      })
      return result
    }
    throw new Error("Erro as enviar mensagem - E1001")
    // console.log("teste api sendMessage", sendMessage)
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao enviar mensagem" }
  }
}
