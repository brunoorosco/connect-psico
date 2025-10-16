"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { AppointmentModel } from "@/domain/model/appointment"

type PaginationParams = {
  page?: number
  limit?: number
}

type Response = {
  data?: AppointmentModel[]
  total: number
  page: number
  lastPage: number
}

export const getAppointmentsUsers = async ({ page = 1, limit = 10 }: PaginationParams): Promise<Response> => {
  const skip = (page - 1) * limit
  const session = await auth()
  if (!session) {
    throw new Error("User not found")
  }

  const isPatient = session.user.role === "DEFAULT"
  const query = isPatient ? { patientId: session.user.id } : { professionalId: session.user.id }

  const [users, total] = await Promise.all([
    await prisma.appointment.findMany({
      where: query,

      select: {
        id: true,
        appointmentDate: true,
        status: true,
        professionalId: true,
        patientId: true,
        roomId: true,
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
      where: query,
    }),
  ])
  
  const mappedUsers = users.map((user) => {
    const { professional, ...restUser } = user
    const { Professional, ...restProfessional } = professional

    // Pega o primeiro professional, caso exista
    const professionalData = Professional ?? {}

    return {
      ...restUser,
      ...professionalData,
      professional: { ...restProfessional },
    }
  })
  return {
    data: mappedUsers as any,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  }
}
