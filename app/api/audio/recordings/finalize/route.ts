// app/api/recordings/finalize/route.ts
export const runtime = "nodejs"

import { NextRequest } from "next/server"

// Aqui você enfileira a transcrição (Whisper/Deepgram/etc.)
// com base no objectKey que já está no MinIO
export async function POST(req: NextRequest) {
  const { objectKey } = await req.json()
  if (!objectKey) return new Response("objectKey required", { status: 400 })

  // TODO: crie um job/queue (Upstash/QStash/SQS/etc.)
  // para baixar do MinIO e transcrever, ou chame o provedor com URL assinada GET.

  // Simples: só confirma recebimento
  return Response.json({ ok: true })
}
