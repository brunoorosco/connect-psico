"use server"
import axios from "axios"
import { env } from "@/config/application"

export const axiosInstanceChatz = axios.create({
  baseURL: `${env.baseUrlChatzApi}/api`,
  withCredentials: true,
})

axiosInstanceChatz.interceptors.request.use(
  async (config) => {
    config.headers.Authorization = env.apiKeyChatz
    return config
  },
  (error) => Promise.reject(error)
)

export const sendMessageApiWhatsapp = async (userPhone: string, message: string) => {
  await axiosInstanceChatz.post("/messages/send", {
    // body: `*PsicoMais:*\nOi ${firstName}, você recebeu ${row.msgCount} nova(s) mensagem(ns) na plataforma nos últimos minutos. Acesse: https://psicomais.com/app`,
    body: `*PsicoMais:*\n${message}`,
    number: "55" + userPhone,
  })
}
