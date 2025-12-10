// services/uploadClient.ts
export async function uploadChunk(sessionId: string, chunk: Blob) {
  const form = new FormData()
  form.append("file", chunk, `chunk-${Date.now()}.webm`)
  form.append("sessionId", sessionId)
  const res = await fetch("/api/audio/upload", {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error("Upload chunk failed: " + txt)
  }
  return res.json()
}

export async function finalizeRecordingRequest(sessionId: string) {
  const res = await fetch("/api/audio/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  })
  if (!res.ok) {
  }

  return res.json()
}

export async function startAsyncTranscription(sessionId: string, key?: string, language = "pt-BR", userId?: string, text?: string) {
  const res = await fetch("/api/audio/recordings/process-async", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      key,
      language,
      userId,
      text
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error("Async transcription start failed: " + txt)
  }

  return res.json()
}
