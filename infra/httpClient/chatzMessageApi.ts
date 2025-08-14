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
