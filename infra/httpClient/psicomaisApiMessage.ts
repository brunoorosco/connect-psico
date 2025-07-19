'use server'
import axios from "axios"
import { env } from "@/config/application"
import { getAccessToken } from "@/actions/token/getToken"

export const axiosInstance = axios.create({
  baseURL: `${env.baseUrlPsicomaisApi}/api`,
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken() // sua função que retorna o token
    if (token) {
      config.headers.Authorization = `Bearer ${token.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
