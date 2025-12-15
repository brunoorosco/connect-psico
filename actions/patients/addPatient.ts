"use server";
import { z } from "zod";
import { prisma } from "@/lib/db"; // ou qualquer cliente DB que usar
import { patientSchema } from "@/domain/model/patient";
import { RegisterSchema } from "@/schemas/auth";
import bcryptjs from "bcryptjs";
import { randomInt } from "node:crypto";
import { getValidTaxId } from "@/utils/taxId";

export const createPatient = async (params: any) => {
  const randow = randomInt(6);
  const hashedPassword = await bcryptjs.hash(randow.toString(), 10);
  const validPatient = patientSchema.safeParse(params);
  const validUser = RegisterSchema.safeParse({
    name: params.name,
    email: params.email,
    phone: params.phone,
    password: hashedPassword,
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
  const sanitizedCpf = getValidTaxId(validPatient.data.cpf);

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
            cpf: sanitizedCpf,
            birthDate: validPatient.data.birthDate,
            emergencyContact: validPatient.data.emergencyContact || null,
            notes: validPatient.data.notes || null,
            cep: validPatient.data.cep || null,
            street: validPatient.data.street || null,
            neighborhood: validPatient.data.neighborhood || null,
            city: validPatient.data.city || null,
            state: validPatient.data.state || null,
            number: validPatient.data.number || null,
            responsibleName: validPatient.data.responsibleName || null,
            responsiblePhone: validPatient.data.responsiblePhone || null,
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
