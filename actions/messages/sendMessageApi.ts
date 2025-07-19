"use server"

import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"

export async function sendMessageApi(receiverId: string, messageData: Record<string, any>) {
  // const tokenResult = await getAccessTokenAction()
  // if (!tokenResult.ok || !tokenResult.accessToken) {
  //   return { ok: false, error: tokenResult.error || "Não autenticado" }
  // }

  try {
    const res = await axiosInstance.post(`/messages/send/${receiverId}`, messageData)
    return res.data
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao enviar mensagem" }
  }
}
