// app/api/recordings/cleanup-part/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { minio } from "@/infra/minio/config"

const BUCKET = process.env.MINIO_BUCKET || "recordings"

export async function POST(req: NextRequest) {
  try {
    const { key, softDelete = false } = await req.json()

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "key inválida" }, { status: 400 })
    }

    // checa se existe (opcional, mas ajuda a idempotência)
    try {
      await minio.statObject(BUCKET, key)
    } catch {
      // não existe? OK (idempotente)
      return NextResponse.json({ ok: true, deleted: 0, missing: true })
    }

    if (softDelete) {
      // move para trash/<key> (copy + remove)
      const destKey = `trash/${key}`
      await minio.copyObject(BUCKET, destKey, `/${BUCKET}/${key}`)
      await minio.removeObject(BUCKET, key)
      return NextResponse.json({ ok: true, moved: 1, from: key, to: destKey })
    } else {
      await minio.removeObject(BUCKET, key)
      return NextResponse.json({ ok: true, deleted: 1, key })
    }
  } catch (e: any) {
    console.error("cleanup-part failed:", e)
    return NextResponse.json(
      { error: "Falha ao remover objeto", details: String(e?.message || e) },
      { status: 500 }
    )
  }
}
