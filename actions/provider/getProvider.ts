"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export const userByProvider = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Não autorizado" }
  }

  const user = await prisma.account.findFirst({ where: { userId: session?.user.id }, select: { provider: true } })
  return { provider: !!user?.provider }
}
