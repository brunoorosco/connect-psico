// app/api/templates/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CertificateConfigSchema } from "@/domain/model/certificateConfig"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()

  const items = await prisma.certificateConfig.findMany({
    where: { userId: session?.user.id },
    select: { id: true, configJson:true },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(items[0])
}

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()
  const parsed = CertificateConfigSchema.safeParse(body.configJson)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }
  const created = await prisma.certificateConfig.create({
    data: {
      userId: session?.user.id as string,
      configJson: parsed.data,
    },
  })
  return NextResponse.json(created, { status: 201 })
}
