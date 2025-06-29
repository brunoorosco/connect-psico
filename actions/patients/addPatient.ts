"use server";
import { z } from "zod";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";
import { RegisterSchema } from "@/schemas/auth";

export const createPatient = async (params: any) => {
  const validPatient = patientSchema.safeParse(params);
  const validUser = RegisterSchema.safeParse({
    name: params.name,
    email: params.email,
    phone: params.phone,
    password: "123123", // talvez você queira gerar dinamicamente ou pedir depois
  });

  if (!validUser.success) {
    console.error("User - Dados inválidos:", validUser.error);
    return { error: "User - Dados inválidos" };
  }

  if (!validPatient.success) {
    console.error("Paciente - Dados inválidos:", validPatient.error);
    return { error: "Paciente - Dados inválidos" };
  }

  const { name, email, phone, password } = validUser.data;

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password, // atenção: armazene isso com hash!
        patientUser: {
          create: {
            medicalRecordId: validPatient.data.medicalRecordId,
            birthDate: validPatient.data.birthDate ? new Date(validPatient.data.birthDate) : null,
            emergencyContact: validPatient.data.emergencyContact || null,
            notes: validPatient.data.notes || null,
            cep: validPatient.data.cep || null,
            street: validPatient.data.street || null,
            neighborhood: validPatient.data.neighborhood || null,
            city: validPatient.data.city || null,
            state: validPatient.data.state || null,
            number: validPatient.data.number || null,
            professionalId: validPatient.data.profissionalId as string,
          },
        },
      },
      include: {
        patientUser: true,
      },
    });

    return newUser;
  } catch (err) {
    console.error("Erro ao criar usuário e paciente:", err);
    return { error: "Erro ao criar usuário e paciente" };
  }
};