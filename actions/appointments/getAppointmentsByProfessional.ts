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

  const data: AppointmentModel[] = rows.map((row: AppointmentModel) => {
    const { professional, patient, ...rest } = row
    const duration = professional?.Professional?.tempoConsulta ?? 60

    // se NÃO existe professionalId no prontuário => é novo
    const primaryProInRecord = patient?.patientUser?.[0]?.professionalId ?? null
    const isNewByRecord: boolean = !primaryProInRecord // ✅ boolean minúsculo

    return {
      id: rest.id,
      appointmentDate: new Date(rest.appointmentDate),
      status: rest.status as AppointmentModel["status"],
      professionalId: rest.professionalId,
      patientId: rest.patientId,
      roomId: rest.roomId,
      duration,
      professional: { id: professional?.id ?? "", name: professional?.name ?? "" },
      patient: { id: patient?.id ?? "", name: patient?.name ?? "" },
      isNewPatient: isNewByRecord,
    }
  })

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  }
}
