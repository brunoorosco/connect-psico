"use server"
import { auth } from "@/auth"
import { Address } from "@/domain/model/professional"
import { prisma } from "@/lib/db"

export async function getProfessionalAddress(): Promise<Address | null> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado")
  }
  const address = await prisma.professional.findUnique({
    where: { userId: session.user.id },
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
  if (!address) return null
  
  return address as Address
}
