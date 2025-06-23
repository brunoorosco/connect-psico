"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const UpdateProfileSchema = z.object({
  userId: z.string().cuid(),
  isProfessional: z.boolean(),
  ufConselho: z.string().optional(),
  numberConselho: z.string().max(6).min(6).optional(),
});

export const updateProvider = async (data: z.infer<typeof UpdateProfileSchema>) => {
  const valid = await UpdateProfileSchema.safeParseAsync(data);
  console.log("dados", data);

  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { userId, isProfessional, ufConselho, numberConselho } = valid.data;

  try {
    // Verificar sobreposição com outras disponibilidades
    const account = await prisma.account.findFirst({
      where: { userId },
    });

    if (account) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isNewProfile: true,
        },
      });
    }
    console.log("updateProvider", updateProvider);
    if (updateProvider) {
      return { error: "Já existe uma disponibilidade que conflita com este horário" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "SUPERVISOR",
      },
    });
    // Criar disponibilidade
    const professional = await prisma.professional.create({
      data: { userId },
    });

    return { success: "Com sucesso", data: professional };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" };
    }

    throw error;
  }
};
