"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";
import { auth } from "@/auth"; // Certifique-se de que está importando corretamente

export const getPatients = async () => {
  const session = await auth(); // Obtém a sessão do usuário autenticado
  try {
    const patients = await prisma.pacientes.findMany({
      where: {
        professionalId: session?.user.id,
      },
      select: {
        id:true,
        medicalRecordId: true,
        cep: true,
        state: true,
        street: true,
        neighborhood: true,
        emergencyContact: true,
        birthDate: true,
        city: true,
        number: true,
        notes: true,
        patient: true,
      },
    });
    console.log("", patients);

    return patients;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return { error: "Erro ao buscar pacientes" };
  }
};

export const deletePatient = async (id: number) => {
  return await prisma.pacientes.delete({ where: { id } });
};
