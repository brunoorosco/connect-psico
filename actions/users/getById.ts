"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const GetUserByIdSchema = z.object({
  id: z.string().cuid("ID inválido"),
});

export const getUserById = async (id: string): Promise<any> => {
  const parsed = GetUserByIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
    },
  });

  if (!user) {
    return { error: "Usuário não encontrado" };
  }

  return user;
};
