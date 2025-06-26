"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const UpdateProfileSchema = z.object({
  id: z.string().cuid(),
  isProfessional: z.boolean(),
  state: z.string().optional(),
  professionalRegistration: z.string().max(6).min(6).optional(),
});

export const updateProvider = async (data: z.infer<typeof UpdateProfileSchema>) => {
  console.log("data", data);
  const valid = await UpdateProfileSchema.safeParseAsync(data);

  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { id, isProfessional, state, professionalRegistration } = valid.data;
  console.log("valid", data);
  try {
    // Verificar sobreposição com outras disponibilidades
    const account = await prisma.account.findFirst({
      where: { userId: id },
    });
    let user;

    if (account) {
      user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          role: isProfessional ? "SUPERVISOR" : "DEFAULT",
          isNewProfile: false,
        },
      });

      console.log("updateProvider", user);
      if (isProfessional) {
        await prisma.professional.create({
          data: { userId: user?.id, numConselho: professionalRegistration, ufConselho: state },
        });
      }
    }

    return { success: true, data: account };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" };
    }

    throw error;
  }
};
