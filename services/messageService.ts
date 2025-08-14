"use server"
import { ingestDigest } from "@/actions/digest"
import { createMessage, sendMessageApi } from "@/actions/messages"
import { getProfessionalById } from "@/actions/users"

type TCreateMessage = { senderId: string; receiverId: string; content: string }

export async function createMessageService(data: TCreateMessage) {
  return await createMessage(data)
}

export async function sendMessageService(receiverId: string, messageData: Record<string, any>) {
  try {
    const user = await getProfessionalById(receiverId)
    if (!user) throw new Error("Erro as enviar mensagem - E1001")

    // 1) Envia para a sua plataforma
    const result = await sendMessageApi(receiverId, messageData)

    // 2) Em vez de enviar WhatsApp agora, acumula no digest
    await ingestDigest(receiverId)

    return result
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao enviar mensagem" }
  }
}
