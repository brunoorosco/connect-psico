"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { auth } from "@/auth"; // Certifique-se de que está importando corretamente

export const countPatientsByProfessionalId = async (): Promise<{ total: number }> => {
  const session = await auth(); // Obtém a sessão do usuário autenticado

  const patients = await prisma.pacientes.count({
    where: {
      professionalId: session?.user.id,
      deletedAt: null
    },
  });
  return { total: patients };
};
