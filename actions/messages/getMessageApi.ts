'use server'
import { axiosInstance } from "@/infra/httpClient/psicomaisApiMessage"

export async function getMessageApi(userId: string) {
  try {
    const res = await axiosInstance.get(`/messages/${userId}`)
    return res.data
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error?.response?.data || error.message)
    return { ok: false, error: "Erro ao buscar mensagem" }
  }
}
