"use server";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar

export const getPatientById = async (id: number) => {
  return await prisma.pacientes.findUnique({ where: { id } });
};
