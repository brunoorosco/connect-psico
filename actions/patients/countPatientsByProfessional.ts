"use server"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar
import { auth } from "@/auth" // Certifique-se de que está importando corretamente

export const countPatientsByProfessionalId = async (): Promise<{ total: number }> => {
  const session = await auth()

  const patients = await prisma.patientProfessional.count({
    where: {
      professionalId: session?.user.id,
      patient: { patientUser: { every: { deletedAt: null } } },
    },
  })
  return { total: patients }
}
