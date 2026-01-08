// src/lib/bff-response.ts
import { AxiosError } from "axios"

export function bffError(error: unknown, label: string) {
  if (error instanceof AxiosError) {
    console.error(`[BFF:${label}]`, {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    })

    return Response.json(error.response?.data || { error: "Upstream error" }, { status: error.response?.status || 502 })
  }

  console.error(`[BFF:${label}]`, error)
  return Response.json({ error: "Internal error" }, { status: 500 })
}
