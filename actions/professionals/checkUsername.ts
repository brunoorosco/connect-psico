"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function checkUsernameAvailability(username: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado")
  }

  if (!username) return { available: false, message: "Usuário inválido" }

  const existing = await prisma.professional.findUnique({
    where: { username },
    select: { userId: true },
  })

  if (existing) {
    return { available: false, message: "Usuário em uso", ownerId: existing.userId }
  }

  return { available: true, message: "Usuário disponível ✅", ownerId: null }
}
