// /app/api/audio/finalize/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const TMP_ROOT = path.join(process.cwd(), "tmp", "audio_sessions")

async function readMeta(sessionDir: string) {
  const metaPath = path.join(sessionDir, "meta.json")
  try {
    const raw = await fs.readFile(metaPath, "utf8")
    return JSON.parse(raw)
  } catch {
    return { parts: [], totalSize: 0 }
  }
}

async function writeMeta(sessionDir: string, meta: any) {
  const metaPath = path.join(sessionDir, "meta.json")
  await fs.writeFile(metaPath, JSON.stringify(meta), "utf8")
}

async function appendTranscript(sessionDir: string, text: string) {
  const tPath = path.join(sessionDir, "transcript.txt")
  await fs.appendFile(tPath, text + "\n", "utf8")
}

// Reusar a função do upload handler (separar em lib é melhor). Aqui replicamos minimalmente:
async function transcribeWithGroq(combinedFilePath: string) {
  const GROQ_URL = process.env.GROQ_API_URL
  const GROQ_KEY = process.env.GROQ_API_KEY
  if (!GROQ_URL || !GROQ_KEY) {
    return `TRANSCRIPTION_PLACEHOLDER for ${path.basename(combinedFilePath)}`
  }
  const fileBuffer = await fs.readFile(combinedFilePath)
  const form = new FormData()
  form.append("file", new Blob([new Uint8Array(fileBuffer)]), path.basename(combinedFilePath))
  form.append("model", "whisper-large-v3-turbo")
  form.append("language", "pt")
  form.append("response_format", "json")
  form.append("temperature", "0")

  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}` } as any,
    body: form as any,
  })
  if (!resp.ok) throw new Error("Groq failed: " + (await resp.text()))
  const json = await resp.json()
  return json?.text || json?.transcript || JSON.stringify(json)
}

async function processRemaining(sessionId: string, sessionDir: string) {
  const meta = await readMeta(sessionDir)
  if (!meta.parts || meta.parts.length === 0) return
  // combine
  const combined = path.join(sessionDir, `final-${Date.now()}.webm`)
  for (const p of meta.parts) {
    const pPath = path.join(sessionDir, p.filename)
    const b = await fs.readFile(pPath)
    await fs.appendFile(combined, b)
  }
  const transcriptText = await transcribeWithGroq(combined)
  await appendTranscript(sessionDir, transcriptText)
  // cleanup parts
  for (const p of meta.parts) {
    await fs.rm(path.join(sessionDir, p.filename)).catch(() => {})
  }
  meta.parts = []
  meta.totalSize = 0
  await writeMeta(sessionDir, meta)
  await fs.rm(combined).catch(() => {})
}

async function summarizeWithOpenAI(text: string) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) {
    return "OPENAI_API_KEY not configured - summary placeholder"
  }
  const payload = {
    model: "gpt-4o-mini", // ajuste conforme sua conta
    messages: [
      { role: "system", content: "Você é um assistente que resume conversas médicas com clareza e concisão." },
      {
        role: "user",
        content: `Resuma a transcrição abaixo em um resumo objetivo, bullets e recomendações:\n\n${text}`,
      },
    ],
    max_tokens: 800,
  }
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    const t = await resp.text()
    throw new Error("OpenAI error: " + t)
  }
  const j = await resp.json()
  // chat completions shape: choices[0].message.content
  return j?.choices?.[0]?.message?.content || JSON.stringify(j)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sessionId = body?.sessionId
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 })
    const sessionDir = path.join(TMP_ROOT, sessionId)

    // process remaining parts (if houver)
    await processRemaining(sessionId, sessionDir)

    // read transcript and call OpenAI
    const tPath = path.join(sessionDir, "transcript.txt")
    let transcript = ""
    try {
      transcript = await fs.readFile(tPath, "utf8")
    } catch {
      transcript = ""
    }

    const summary = await summarizeWithOpenAI(transcript)

    // opcional: salvar summary
    await fs.writeFile(path.join(sessionDir, "summary.txt"), summary, "utf8")

    return NextResponse.json({ ok: true, summary })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
