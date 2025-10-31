"use server"

import { prisma } from "@/lib/db"

export async function updatePrepaymentAction(userId: string, enabled: boolean) {
  try {
    const existing = await prisma.bankAccount.findFirst({
      where: { userId },
    })

    if (!existing) {
      // cria conta caso não exista
      await prisma.bankAccount.create({
        data: {
          userId,
          accountType: "CHECKING", // ou defina um padrão
          bankName: "",
          branchNumber: "",
          accountNumber: "",
          pixKey: "",
          prepaymentEnabled: enabled,
        },
      })
    } else {
      await prisma.bankAccount.update({
        where: { id: existing.id },
        data: { prepaymentEnabled: enabled },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar prepaymentEnabled:", error)
    return { success: false, message: "Erro ao atualizar prepayment" }
  }
}
