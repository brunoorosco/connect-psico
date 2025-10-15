// app/api/templates/[id]/route.ts
import { prisma } from "@/lib/db"
import { CertificateConfigSchema } from "@/domain/model/certificateConfig"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Prisma } from "@prisma/client"

type Params = { params: { id: number } }

export async function GET(_: Request, { params }: Params) {
  const session = await auth()
  const item = await prisma.certificateConfig.findFirst({
    where: { id: params.id, userId: session?.user.id },
  })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth()
  const body = await req.json()

  const parsed = CertificateConfigSchema.safeParse(body.configJson)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  // ✅ sanitiza para JSON puro (sem undefined) e casa com o tipo do Prisma
  const configJson = JSON.parse(JSON.stringify(parsed.data))

  const updated = await prisma.certificateConfig.update({
    where: { id: Number(params.id), userId: session?.user.id },
    data: {
      configJson,
      name: parsed.data.type, // ok, é string
    },
  })

  return NextResponse.json(updated)
}
