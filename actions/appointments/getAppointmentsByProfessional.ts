"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { AppointmentModel } from "@/domain/model/appointment";

type PaginationParams = {
  page?: number;
  limit?: number;
};

type Response = {
  data?: AppointmentModel[];
  total: number;
  page: number;
  lastPage: number;
};

export const getAppointmentsUsers = async ({
  page = 1,
  limit = 10,
}: PaginationParams): Promise<Response>  => {
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
        professionalId: true,
        patientId: true,
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
    data: mappedUsers as AppointmentModel[],
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};