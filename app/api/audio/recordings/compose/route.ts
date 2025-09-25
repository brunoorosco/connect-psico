// app/api/recordings/compose/route.ts
export const runtime = "nodejs"
import { minio } from "@/infra/minio/config"
import { NextRequest } from "next/server"

// ATENÇÃO: composeObject está disponível no SDK v8 (MinIO Server recente).
export async function POST(req: NextRequest) {
  const { destKey, partKeys } = await req.json()
  if (!destKey || !Array.isArray(partKeys) || partKeys.length === 0) {
    return new Response("destKey and partKeys required", { status: 400 })
  }

  // @ts-ignore: tipos ComposeSource podem não estar expostos no d.ts dependendo da versão
  const sources = partKeys.map((k: string) => new (minio as any).ComposeSource('recordings', k))

  await (minio as any).composeObject("recordings", destKey, sources)

  // Opcional: apagar os partes
  // for (const k of partKeys) await minio.removeObject(MINIO_BUCKET, k)

  return Response.json({ ok: true, objectKey: destKey })
}
