"use server";
import { prisma } from "@/lib/db";

export const getAllUsers = async (): Promise<any> => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
      emailVerified: true,
      isTwoFactorAuthEnabled: true,
      twoFactorAuthVerified: true,
    },
  });
  if (!users) {
    return { error: "Usuário não encontrado" };
  }

  return users;
};
