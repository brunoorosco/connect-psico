"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

const UpdateProfileSchema = z.object({
  id: z.string().cuid(),
  isProfessional: z.boolean(),
  state: z.string().optional(),
  professionalRegistration: z.string().max(6).min(6).optional(),
});

export const completeOnboarding = async (data: z.infer<typeof UpdateProfileSchema>) => {
  const valid = await UpdateProfileSchema.safeParseAsync(data);
console.log('[updateProvider.ts:17]', {  data});
  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { id, isProfessional, state, professionalRegistration } = valid.data;
  try {
    //valida se ele vem do provider google
    const account = await prisma.user.findFirst({
      where: { id },
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
      if (isProfessional) {
        await prisma.professional.upsert({
          where: { userId: id },
          update: { numConselho: professionalRegistration, ufConselho: state },
          create: {
            userId: user?.id,
            numConselho: professionalRegistration,
            ufConselho: state,
            valorAtendimento: 5000,
          },
        });
      }
    }
    revalidatePath("/app");
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" };
    }

    throw error;
  }
};
