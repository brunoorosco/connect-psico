"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function getProfessionalAddress(userId: string) {
  // Busca no banco (exemplo com Prisma)
  const address = await prisma.professional.findUnique({
    where: { userId },
    select: {
      cep: true,
      cidade: true,
      bairro: true,
      estado: true,
      logradouro: true,
      numero: true,
      complemento: true,
    },
  })

  return address
}
