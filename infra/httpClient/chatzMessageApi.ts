"use server"
import axios from "axios"
import { env } from "@/config/application"

export const axiosInstanceChatz = axios.create({
  baseURL: `${env.baseUrlChatzApi}/api`,
  withCredentials: true,
})

const axiosInstanceEvo = axios.create({
  baseURL: `${env.baseUrlEVOApi}`,
  withCredentials: true,
})

axiosInstanceChatz.interceptors.request.use(
  async (config) => {
    config.headers.Authorization = env.apiKeyChatz
    return config
  },
  (error) => Promise.reject(error),
)

axiosInstanceEvo.interceptors.request.use(
  async (config) => {
    config.headers.apikey = env.apiKeyEVO
    return config
  },
  (error) => Promise.reject(error),
)

export const sendMessageApiWhatsapp = async (userPhone: string, message: string, signature = true) => {
  if (!userPhone || userPhone === "") return
  const msg = signature ? `*PsicoMais:*\n${message}` : message

  await axiosInstanceEvo.post(`/message/sendText/${env.instanceEVO}`, {
    // body: `*PsicoMais:*\nOi ${firstName}, você recebeu ${row.msgCount} nova(s) mensagem(ns) na plataforma nos últimos minutos. Acesse: https://psicomais.com/app`,
    text: msg,
    number: "55" + userPhone,
  })
}

export const sendMediaApiWhatsapp = async (userPhone: string, message: string, mediaUrl: string, signature = true) => {
  if (!userPhone || userPhone === "") return
  const msg = signature ? `*PsicoMais:*\n${message}` : message

  await axiosInstanceEvo.post(`/message/sendMedia/${env.instanceEVO}`, {
    number: "55" + userPhone,
    mediatype: "image", // image, video or document
    mimetype: "image/png",
    caption: msg,
    media: mediaUrl,
    fileName: "Imagem.png",
  })
}

export const sendPixCodeViaWhatsapp = async (userPhone: string, pixCode: string, signature = true) => {
  if (!userPhone || userPhone === "") return
  const msg = signature
    ? `*PsicoMais:*\nCódigo PIX para pagamento:\n${pixCode}`
    : `Código PIX para pagamento:\n${pixCode}`

  const body = {
    number: `55${userPhone}`,
    text: msg, // ou “body”: msg dependendo da versão da API
    // você pode adicionar “options” se quiser: delay, presence, linkPreview etc
    options: {
      delay: 3000,
      linkPreview: true,
    },
  }

  const url = `/message/sendMedia/${env.instanceEVO}`

  const result = await axiosInstanceEvo.post(url, body)

  return result.data
}
