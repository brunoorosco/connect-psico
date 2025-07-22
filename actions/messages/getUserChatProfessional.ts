"use server"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar
import { auth } from "@/auth" // Certifique-se de que está importando corretamente
import { UserChat } from "@/domain/model/patient"

export const getUserChatProfessionals = async (userIds: string[]): Promise<UserChat[] | { error: string }> => {
  const session = await auth() // Obtém a sessão do usuário autenticado
  if (!session) {
    return { error: "Usuário não autenticado" }
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        email: true,
        image: true,
        id: true,
        name: true,
        role: true,
        Professional: {
          select: {
            id: true,
          },
        },
      },
    })
    const userMapped = users.map((item) => ({
      id: item.Professional?.id || "",
      userId: item.id,
      name: item.name,
      image: item.image || "",
      isOnline: false,
      role: item.role,
    }))
    return userMapped as UserChat[]
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return { error: "Erro ao buscar pacientes" }
  }
}
