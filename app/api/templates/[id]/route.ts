// app/api/templates/[id]/route.ts
import { prisma } from "@/lib/db"
import { CertificateConfigSchema } from "@/domain/model/certificateConfig"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

type Params = { params: { id: number } }

export async function GET(_: Request, { params }: Params) {
  console.log(params)
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
  // opcional: validar name (string) se vier
  const updated = await prisma.certificateConfig.update({
    where: { id: params.id },
    data: {
      userId: session?.user?.id,
      configJson: parsed.data,
    },
  })
  return NextResponse.json(updated)
}
