"use server";
import { prisma } from "@/lib/db";

export const getProfessionalAvailabilities = async (userId: string) => {
  console.log("getProfessionalAvailabilities called with userId:", userId);
  const professional = await prisma.professional.findUnique({
    where: { userId, user: { active: true } },
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
