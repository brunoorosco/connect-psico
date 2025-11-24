"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function deleteAppointment(id: number) {
  try {
    // 🔐 Verifica usuário logado
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Não autorizado",
      }
    }

    const professionalId = session.user.id

    // 🔎 Verifica se o agendamento pertence ao profissional
    const appointment = await prisma.appointment.findFirst({
      where: { id, professionalId },
      select: { id: true },
    })

    if (!appointment) {
      return {
        success: false,
        message: "Agendamento não encontrado",
      }
    }

    // 🗑️ Deleta
    await prisma.appointment.delete({
      where: { id },
    })

    return {
      success: true,
      message: "Agendamento removido com sucesso",
    }
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error)

    if (error instanceof PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Erro no banco de dados",
      }
    }

    return {
      success: false,
      message: "Erro inesperado",
    }
  }
}
