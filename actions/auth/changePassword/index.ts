"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  twoFactorEnabled: boolean
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Não autorizado" }
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    if (!user || !user.password) {
      return { error: "Usuário não encontrado" }
    }

    // Verifica senha atual
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password)

    if (!isValidPassword) {
      return { error: "Senha atual incorreta" }
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Atualiza no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isTwoFactorAuthEnabled: data.twoFactorEnabled,
      },
    })

    return { success: "Senha alterada com sucesso" }
  } catch {
    return { error: "Erro ao alterar senha" }
  }
}
