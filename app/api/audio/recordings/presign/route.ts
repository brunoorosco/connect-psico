// app/api/recordings/presign/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { minio } from "@/infra/minio/config" // seu client
// se tiver uma const de bucket, use-a:
const BUCKET = process.env.MINIO_BUCKET || "recordings"

// (opcional) helper rápido para garantir bucket em dev
async function ensureBucket() {
  try {
    const exists = await minio.bucketExists(BUCKET).catch(() => false)
    if (!exists) {
      await minio.makeBucket(BUCKET)
    }
  } catch (e) {
    // Em prod, talvez você prefira logar/monitorar
    console.error("ensureBucket failed:", e)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const {
    // quando fizer upload de partes, mande a key já pronta, ex.:
    // sessions/<sessionId>/part-00001.webm
    key,
    // fallback tradicional:
    ext = "webm",
    prefix = "recordings",
    // se quiser assinar também Content-Type (veja observação abaixo)
    contentType,
  } = body

  // (opcional) em dev
  await ensureBucket()

  // se o cliente passou key, use; senão gere por ext/prefix
  const objectKey: string = key ?? `${prefix}/${crypto.randomUUID()}.${ext}`

  // expiração da URL (segundos)
  const expires = 300


  // 📌 Simples e robusto: presignedUrl("PUT") sem headers adicionais.
  // => No PUT do cliente, NÃO envie Content-Type.
  const url = await minio.presignedUrl("PUT", BUCKET, objectKey, expires)
  // 🔄 Alternativa: se você QUISER obrigar Content-Type no PUT,
  // use presignedPutObject e envie o MESMO header no fetch do cliente:
  // const url = await minio.presignedPutObject(
  //   BUCKET,
  //   objectKey,
  //   expires,
  //   { "Content-Type": contentType ?? "application/octet-stream" }
  // )

  return NextResponse.json({ url, key: objectKey, objectKey, expires })
}
