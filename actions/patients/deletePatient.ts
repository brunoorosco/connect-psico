"use server"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar

export const deletePatient = async (id: number) => {
  if (typeof id !== "number" || id <= 0) {
    throw new Error("ID inválido.")
  }
  try {
    const updated = await prisma.pacientes.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return updated
  } catch (error: any) {
    if (error.code === "P2025") {
      // Código do Prisma quando não encontra o registro
      throw new Error("Paciente não encontrado.")
    }
    throw new Error("Erro ao deletar paciente: " + error.message)
  }
}
