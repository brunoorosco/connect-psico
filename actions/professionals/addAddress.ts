"use server"

import { auth } from "@/auth"
import { Address, addressSchema } from "@/domain/model/professional"
import { prisma } from "@/lib/db"

export async function addProfessionalAddress(params: Address) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado")
  }

  const result = addressSchema.safeParse(params)

  if (!result.success) {
    console.log(result.error.format()) // erros formatados
    throw new Error("Paramametros inválidos")
  }
  const validData = result.data

  const address = await prisma.professional.update({
    where: { userId: session.user.id },
    data: {
      cep: validData.cep?.replace(/\D/g, ""), // remove máscara
      cidade: validData.cidade || "",
      bairro: validData.bairro || "",
      estado: validData.estado || "",
      logradouro: validData.logradouro || "",
      numero: validData.numero || "",
      complemento: validData.complemento || "",
    },
  })

  return address
}
