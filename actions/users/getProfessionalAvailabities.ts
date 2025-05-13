"use server";
import { prisma } from "@/lib/db";

export const getProfessionalAvailabilities = async (userId: string) => {
  const professional = await prisma.professional.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          availabilities: {
            select: {
              id: true,
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  });
 if (!professional) {
    throw new Error("Profissional não encontrado");
  }

  return professional.user.availabilities;
};
