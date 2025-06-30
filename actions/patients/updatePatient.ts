"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";

export const updatePatient = async (prontuarioId: string, data: any) => {
  const result = patientSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Dados inválidos");
  }

  return await prisma.pacientes.update({
    where: { medicalRecordId: prontuarioId },
    data: result.data,
  });
};
