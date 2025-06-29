"use server";
import { z } from "zod";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";
import { RegisterSchema } from "@/schemas/auth";

export const createPatient = async (params: unknown) => {
  const { data, success } = patientSchema.safeParse(params);
  const validUser = await RegisterSchema.safeParse(params);

  if (!validUser.success) {
    return {
      error: "Dados inválidos",
    };
  }

  if (!success) {
    throw new Error("Dados inválidos");
  }
  const newUser = await prisma.user.create({
    data: {
      name: validUser.data.name,
      email: validUser.data.email,
      phone: validUser.data.phone,
    },
  });

  if (newUser) {
    const newPatient = await prisma.pacientes.create({
      data: {
        medicalRecordId: data.medicalRecordId,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        emergencyContact: data.emergencyContact || null,
        notes: data.notes || null,
        cep: (data as any).cep || null,
        street: (data as any).street || null,
        neighborhood: (data as any).neighborhood || null,
        city: (data as any).city || null,
        state: (data as any).state || null,
        number: (data as any).number || null,
        patientId: data.patientId,
        professionalId: data.profissionalId,
      },
    });
    return newPatient;
  }

  return { success: false };
};

export const getPatients = async () => {
  return await prisma.pacientes.findMany();
};

export const getPatientById = async (id: number) => {
  return await prisma.pacientes.findUnique({ where: { id } });
};

export const updatePatient = async (id: number, data: unknown) => {
  const result = patientSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Dados inválidos");
  }

  return await prisma.pacientes.update({
    where: { id },
    data: result.data,
  });
};

export const deletePatient = async (id: number) => {
  return await prisma.pacientes.delete({ where: { id } });
};
