// app/api/audio/recordings/transcribe/route.ts
export const runtime = "nodejs"

import { minio } from "@/infra/minio/config"
import axios, { AxiosError, AxiosResponse } from "axios"
import { NextRequest, NextResponse } from "next/server"
import util from "node:util"

type GroqSuccess = {
  text?: string
  segments?: unknown[] // quando response_format = "verbose_json"
  x_groq?: { id?: string } | Record<string, unknown>
}

type GroqFailure = {
  error?: {
    message?: string
    type?: string
  }
}

function stripEdgeQuotes(url: string) {
  // remove aspas simples/dobradas acidentais no começo/fim
  return url.trim().replace(/^['"]+|['"]+$/g, "")
}

function normalizeGroqData(res: AxiosResponse): GroqSuccess | GroqFailure | string | unknown {
  // Axios já tenta parsear JSON. Se vier texto, devolvemos string.
  // Se vier algo inesperado, retornamos cru.
  return res.data
}

export async function POST(req: NextRequest) {
  try {
    const { key, language = "pt", response_format = "json", sessionId, part } = await req.json()

    if (!key) {
      return NextResponse.json({ error: "key required" }, { status: 400 })
    }

    // URL GET temporária para o Groq baixar o áudio do MinIO
    const rawUrl = await minio.presignedGetObject("recordings", key, 600)
    const presignedGet = stripEdgeQuotes(String(rawUrl))

    // DICA: evite logar a URL completa em produção

    const res = await axios.post<GroqSuccess & GroqFailure>(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        model: "whisper-large-v3-turbo",
        url: presignedGet,
        language,
        response_format,
        temperature: 0,
        // ...(response_format === "verbose_json"
        //   ? { timestamp_granularities: ["segment", "word"] }
        //   : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
          "Content-Type": "multipart/form-data",
        },
        // queremos inspecionar o payload mesmo em 4xx/5xx
        validateStatus: () => true,
        // força Axios a devolver string se não for JSON
        transformResponse: [
          (data, headers) => {
            const ct = headers?.["content-type"] || headers?.["Content-Type"] || ""
            if (typeof data === "string") {
              if (ct.includes("application/json")) {
                try {
                  return JSON.parse(data)
                } catch {
                  // deixa como string para debugging
                  return data
                }
              }
              return data // texto simples/HTML
            }
            return data
          },
        ],
      }
    )

    const data = normalizeGroqData(res)
    const contentType = (res.headers["content-type"] as string) || (res.headers["Content-Type"] as string) || ""

    // LOG sempre que não for 2xx
    if (res.status < 200 || res.status >= 300) {
      console.error("---- GROQ ERROR HTTP ----")
      console.error("status:", res.status)
      console.error("content-type:", contentType)
      console.error("x-request-id:", res.headers["x-request-id"] ?? null)
      console.error("headers (subset):", {
        date: res.headers["date"],
        "cf-ray": res.headers["cf-ray"],
        "x-request-id": res.headers["x-request-id"],
      })
      console.error("body (raw):", util.inspect(data, { depth: 5 }))

      return NextResponse.json(
        {
          error: "Groq STT HTTP error",
          status: res.status,
          // devolvemos detalhes TEMPORARIAMENTE para debugar
          details: typeof data === "string" ? data : (data as GroqFailure | GroqSuccess),
          requestId: res.headers["x-request-id"] ?? null,
        },
        { status: 502 }
      )
    }

    // Envelope de erro padrão do Groq dentro de 2xx (raro, mas tratamos)
    if ((data as GroqFailure)?.error) {
      const errObj = (data as GroqFailure).error!
      console.error("---- GROQ ERROR ENVELOPE ----")
      console.error("message:", errObj.message)
      console.error("type:", errObj.type)
      console.error("x-request-id:", res.headers["x-request-id"] ?? null)

      return NextResponse.json(
        {
          error: "Groq STT failed",
          type: errObj.type ?? "unknown_error",
          details: errObj.message ?? "Unknown error",
          requestId: res.headers["x-request-id"] ?? null,
        },
        { status: 502 }
      )
    }

    // Sucesso
    const success = data as GroqSuccess
    return NextResponse.json({
      text: success?.text ?? "",
      // segments: success?.segments, // se usar verbose_json
      x_groq: success?.x_groq ?? null,
      sessionId,
      part,
      key,
    })
  } catch (e) {
    const ax = e as AxiosError
    console.error("---- AXIOS/NETWORK ERROR ----")
    console.error("message:", ax.message)
    // Se houve resposta do servidor, loga
    if (ax.response) {
      console.error("status:", ax.response.status)
      console.error("headers:", ax.response.headers)
      console.error("data:", util.inspect(ax.response.data, { depth: 5 }))
    } else if (ax.request) {
      // Erro de rede/timeout sem resposta
      console.error("no response, request made")
    } else {
      console.error("setup error")
    }

    return NextResponse.json(
      {
        error: "Groq STT request failed",
        details: ax.message,
        cause: ax.response?.data ?? null,
      },
      { status: 502 }
    )
  }
}
