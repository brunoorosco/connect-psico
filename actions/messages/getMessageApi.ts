'use server'
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"

export async function getMessageApi(userId: string) {
  try {
    const res = await axiosInstance.get(`/messages/${userId}`)
    return res.data
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao enviar mensagem" }
  }
}
