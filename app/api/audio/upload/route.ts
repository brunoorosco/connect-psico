// /app/api/audio/upload/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const TMP_ROOT = path.join(process.cwd(), "tmp", "audio_sessions")
const CHUNK_LIMIT = 0.5 * 1024 * 1024 // MB

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

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

// Placeholder: realiza a chamada para Groq (substitua pelo endpoint real)
async function transcribeWithGroq(combinedFilePath: string) {
  const GROQ_URL = process.env.GROQ_API_URL
  const GROQ_KEY = process.env.GROQ_API_KEY
  if (!GROQ_URL || !GROQ_KEY) {
    // apenas para dev: retorna um texto fake
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
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      // NOTA: não setar Content-Type ao usar FormData
    } as any,
    body: form as any,
  })
  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error("Groq transcription failed: " + txt)
  }
  const json = await resp.json()
  // adaptar conforme resposta real da Groq
  return json?.text || json?.transcript || JSON.stringify(json)
}

async function processBatch(sessionId: string, sessionDir: string, meta: any) {
  // combina os arquivos que estão em meta.parts
  if (!meta.parts || meta.parts.length === 0) return
  const combinedName = `combined-${Date.now()}.webm`
  const combinedPath = path.join(sessionDir, combinedName)
  // combine append
  for (const p of meta.parts) {
    const pPath = path.join(sessionDir, p.filename)
    const buf = await fs.readFile(pPath)
    await fs.appendFile(combinedPath, buf)
  }
  // chama Groq
  const transcriptText = await transcribeWithGroq(combinedPath)
  await appendTranscript(sessionDir, transcriptText)

  // remove parts e reseta meta
  for (const p of meta.parts) {
    await fs.rm(path.join(sessionDir, p.filename)).catch(() => {})
  }
  meta.parts = []
  meta.totalSize = 0
  await writeMeta(sessionDir, meta)
  // opcional: remover combinedPath depois de processar
  await fs.rm(combinedPath).catch(() => {})
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file") as unknown as File | null
    const sessionId = (form.get("sessionId") as string) || `s-${Date.now()}`
    if (!file) return NextResponse.json({ error: "file missing" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)

    const sessionDir = path.join(TMP_ROOT, sessionId)
    await ensureDir(sessionDir)

    const filename = `part-${Date.now()}.webm`
    const filePath = path.join(sessionDir, filename)
    await fs.writeFile(filePath, buf)

    const meta = await readMeta(sessionDir)
    meta.parts.push({ filename, size: buf.length })
    meta.totalSize = (meta.totalSize || 0) + buf.length
    await writeMeta(sessionDir, meta)

    if (meta.totalSize >= CHUNK_LIMIT) {
      // envia para Groq / transcreve
      try {
        await processBatch(sessionId, sessionDir, meta)
      } catch (e) {
        console.error("processBatch error:", e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
