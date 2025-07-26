"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export const promoveUserToSupervisor = async (userId: string) => {
  if (!userId) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    }
  }
  const session = await auth()
  if (session?.user.role === "ADMIN")
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: "SUPERVISOR",
        },
      })

      return {
        success: "Usuário alterado para Profissional com sucesso!",
      }
    } catch (error) {
      console.error(error)
      return {
        error: "Erro inesperado ao atualizar o role.",
      }
    }
}
