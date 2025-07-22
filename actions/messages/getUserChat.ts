"use server"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar
import { auth } from "@/auth" // Certifique-se de que está importando corretamente
import { UserChat } from "@/domain/model/patient"

export const getUserChat = async (): Promise<{userId:string}[] | { error: string }> => {
  const session = await auth() // Obtém a sessão do usuário autenticado
  if (!session) {
    return { error: "Usuário não autenticado" }
  }
  
  try {
    const users = await prisma.pacientes.findMany({
      where: {
        professionalId: session?.user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        patient: {
          select: {
            email: true,
            image: true,
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })
    const userMapped = users.map((item) => ({
      // id: item.id,
      userId: item.patient.id,
      // name: item.patient.name,
      // image: item.patient.image || "",
      // isOnline: false,
      // role: item.patient.role,
    }))
    return userMapped as UserChat[]
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return { error: "Erro ao buscar pacientes" }
  }
}
