"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

interface PaginationParams1 {
  page?: number
  limit?: number
}

export const getAppointmentsByPatient = async ({ page = 1, limit = 10 }: PaginationParams1) => {
  const skip = (page - 1) * limit
  const session = await auth()
  if (!session) {
    throw new Error("User not found")
  }

  const [users, total] = await Promise.all([
    await prisma.appointment.findMany({
      where: {
        patientId: session.user.id,
        // appointmentDate: { gte: new Date() },
        patient: {
          role: "DEFAULT",
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
       // appointmentDate: { gte: new Date() },
        professionalId: session.user.id,
      },
    }),
  ])

  return {
    data: users,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  }
}
