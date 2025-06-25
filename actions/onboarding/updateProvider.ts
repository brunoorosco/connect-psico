"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const UpdateProfileSchema = z.object({
  userId: z.string().cuid(),
  isProfessional: z.boolean(),
  state: z.string().optional(),
  professionalRegistration: z.string().max(6).min(6).optional(),
});

export const updateProvider = async (data: z.infer<typeof UpdateProfileSchema>) => {
  const valid = await UpdateProfileSchema.safeParseAsync(data);

  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { userId, isProfessional, state, professionalRegistration } = valid.data;

  try {
    // Verificar sobreposição com outras disponibilidades
    const account = await prisma.account.findFirst({
      where: { userId },
    });
    let user;

    if (account) {
      user = await prisma.user.update({
        where: {
          id: userId,
          role: isProfessional ? "SUPERVISOR" : "DEFAULT",
        },
        data: {
          isNewProfile: false,
        },
      });

      console.log("updateProvider", updateProvider);
      if (isProfessional) {
        await prisma.professional.create({
          data: { userId: user?.id, numConselho: professionalRegistration, ufConselho: state },
        });
      }
    }

    return { success: "Com sucesso", data: account };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" };
    }

    throw error;
  }
};
