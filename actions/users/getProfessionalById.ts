"use server";
import { prisma } from "@/lib/db";

export const getProfessioanlById = async (id: string): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id, active: true },
    include: {
      Professional: true,
    },
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
  const { Professional, ...restUser } = user;
  // Pega o primeiro professional, caso exista
  const professionalData = Professional ?? {};

  return {
    ...restUser,
    ...professionalData,
  };
};
