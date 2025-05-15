"use server";
import { prisma } from "@/lib/db";

export const getUserById = async (id: string): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
      emailVerified: true,
      isTwoFactorAuthEnabled: true,
      twoFactorAuthVerified: true,
    },
  });
  if (!user) {
    return { error: "Usuário não encontrado" };
  }

  return user;
};
