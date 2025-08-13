"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";

export const updatePatient = async (prontuarioId: string, data: any) => {
  try {
    const result = patientSchema.safeParse(data);
    if (!result.success) {
      throw new Error("Dados inválidos");
    }
    return await prisma.pacientes.update({
      where: { medicalRecordId: prontuarioId },
      data: {
        patient:{update:{phone:result.data.phone}},
        cep: result.data.cep,
        birthDate: result.data.birthDate,
        emergencyContact: result.data.emergencyContact || null,
        notes: result.data.notes || null,
        street: result.data.street || null,
        neighborhood: result.data.neighborhood || null,
        city: result.data.city || null,
        state: result.data.state || null,
        number: result.data.number || null,
      },
    });
  } catch (error) {
    console.error("error", error);
    throw new Error("Error patient updated");
  }
};
