"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { AppointmentModel, StatusAppointment } from "@/domain/model/appointment"

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
  const whereBase = isPatient ? { patientId: session.user.id } : { professionalId: session.user.id }

  const [rows, total] = await Promise.all([
    prisma.appointment.findMany({
      where: whereBase,
      orderBy: { appointmentDate: "asc" },
      select: {
        id: true,
        appointmentDate: true,
        status: true,
        professionalId: true,
        patientId: true,
        roomId: true,
        professional: {
          select: {
            id: true,
            name: true,
            Professional: {
              select: { tempoConsulta: true },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            patientUser: {
              select: { professionalId: true },
              take: 1,
            },
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where: whereBase }),
  ])

  const data: AppointmentModel[] = rows.map((row) => {
    const { professional, patient, ...rest } = row
    const duration = professional?.Professional?.tempoConsulta ?? 60

    return {
      ...rest,
      duration,
      professional: {
        id: professional.id,
        name: professional.name,
        Professional: professional.Professional,
      },
      patient: {
        ...patient,
        patientUser: patient.patientUser.map((u) => ({
          professionalId: u.professionalId ?? "",
        })),
      },
    } as AppointmentModel
  })

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  }
}
