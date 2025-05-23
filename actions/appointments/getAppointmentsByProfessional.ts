"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getAppointmentsUsers = async ({ page = 1, limit = 10 }: PaginationParams) => {
  const skip = (page - 1) * limit;
  const session = await auth();
  if (!session) {
    throw new Error("User not found");
  }

  const omitData = {
    omit: {
      password: true,
      emailVerified: true,
      isTwoFactorAuthEnabled: true,
      twoFactorAuthVerified: true,
    },
  };

  const [users, total] = await Promise.all([
    await prisma.appointment.findMany({
      where: {
        professionalId: session.user.id,
        professional: {
          role: "SUPERVISOR",
        },
      },
      select: {
        id: true,
        appointmentDate: true,
        professional: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.appointment.count({
      where: {
        professionalId: session.user.id,
         professional: {
          role: "SUPERVISOR",
        },
      },
    }),
  ]);

  return {
    data: users,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};
