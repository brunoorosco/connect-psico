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
        status: true,
        professional: {
          select: {
            name: true,
            Professional: {
              select: {
                tempoConsulta: true,
              },
            },
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
      },
    }),
  ]);

  const mappedUsers = users.map((user) => {
    const { professional, ...restUser } = user;
    const { Professional, ...restProfessional } = professional;

    // Pega o primeiro professional, caso exista
    const professionalData = Professional ?? {};

    return {
      ...restUser,
      ...professionalData,
      professional: { ...restProfessional },
    };
  });
  return {
    data: mappedUsers,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};
