"use server"

import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"

export async function sendMessageApi(receiverId: string, messageData: Record<string, any>) {
  try {
    const res = await axiosInstance.post(`/messages/send/${receiverId}`, messageData)
    return res.data
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao enviar mensagem" }
  }
}
