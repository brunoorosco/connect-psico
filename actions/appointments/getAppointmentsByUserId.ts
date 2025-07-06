"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

interface PaginationParams1 {
  page?: number;
  limit?: number;
  userId: string;
}

export const getAppointmentsByUserId = async ({userId, page = 1, limit = 10 }: PaginationParams1) => {
  const skip = (page - 1) * limit;
  const session = await auth();
  if (!session) {
    throw new Error("User not found");
  }

  const [appointments, total] = await Promise.all([
   await prisma.appointment.findMany({
      where: {
        patientId: userId,
        professionalId: session.user.id,
      },
      select: {
        id: true,
        appointmentDate: true,
        status:true,
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
        patientId: userId,
        professionalId: session.user.id,
      },
    }),
  ]);

  return {
    data: appointments,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};
