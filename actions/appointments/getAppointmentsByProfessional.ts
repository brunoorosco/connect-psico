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
        patientId: session.user.id,
        patient: {
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
      },
    }),
  ]);
  console.log("123456",users);

  return {
    data: users,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};
