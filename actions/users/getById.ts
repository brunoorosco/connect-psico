"use server";
import { prisma } from "@/lib/db";

export const getUserById = async (id: string): Promise<any> => {
  console.log("chegou")
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
  console.log("", user.id);

  return user;
};
