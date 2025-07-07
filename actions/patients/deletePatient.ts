"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar

export const deletePatient = async (id: number) => {
  return await prisma.pacientes.delete({ where: { id } });
};
