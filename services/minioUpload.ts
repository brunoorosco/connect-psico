// services/minioUpload.ts
export async function getPresignedPut(ext = "webm", prefix = "recordings") {
  const r = await fetch("/api/audio/recordings/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext, prefix }),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<{ url: string; objectKey: string; expires: number }>
}

export async function putToPresignedUrl(url: string, blob: Blob) {
  // Não envie Content-Type se não assinou com ele
  const put = await fetch(url, { method: "PUT", body: blob })
  if (!put.ok) throw new Error(`PUT failed: ${put.status} ${put.statusText}`)
  return true
}

export async function finalizeRecording(objectKey: string) {
  const r = await fetch("/api/audio/recordings/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey }),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<{ ok: true }>
}

// 1) presign por key específica (útil p/ part-00001, part-00002...)
export async function getPresignedPutForKey(key: string, contentType?: string) {
  const r = await fetch("/api/audio/recordings/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentType }),
  })
  if (!r.ok) throw new Error(await r.text())
  // algumas rotas retornam { url, key } ou { url, objectKey }
  const json = await r.json()
  return { url: json.url as string, key: (json.key ?? json.objectKey) as string }
}

// 2) chamar o servidor p/ transcrever um chunk (Groq usa presigned GET gerado lá)
export async function transcribeChunk(opts: {
  key: string
  language?: string
  response_format?: "text" | "json" | "verbose_json"
  sessionId?: string
  part?: number
}) {
  const r = await fetch("/api/audio/recordings/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<{ text?: string; [k: string]: any }>
}
