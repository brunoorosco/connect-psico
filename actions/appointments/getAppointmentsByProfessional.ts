"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { AppointmentModel } from "@/domain/model/appointment"

type PaginationParams = {
  page?: number
  limit?: number
}

type Response = {
  data: AppointmentModel[]
  total: number
  page: number
  lastPage: number
}

export const getAppointmentsUsers = async ({ page = 1, limit = 10 }: PaginationParams): Promise<Response> => {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const skip = (page - 1) * limit
  const isPatient = session.user.role === "DEFAULT"
  const query = isPatient ? { patientId: session.user.id } : { professionalId: session.user.id }

  // 🔹 Buscar appointments e total em paralelo
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
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
              select: { tempoConsulta: true },
            },
          },
        },
        patient: { select: { name: true, image: true } },
        payment: {
          select: { status: true, amountCents: true, paidAt: true, providerPaymentId: true },
        },
      },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where: query }),
  ])

  // 🔹 Opcional: otimizar a busca de pacientes já existentes
  const patientIds = appointments.map((a) => a.patientId)
  const existingPatients = await prisma.patientProfessional.findMany({
    where: {
      patientId: { in: patientIds },
      professionalId: session.user.id,
    },
    select: { patientId: true },
  })

  const existingPatientIds = new Set(existingPatients.map((p) => p.patientId))
  console.log(existingPatientIds)

  // 🔹 Montagem dos dados
  const mappedAppointments = appointments.map((app) => {
    const { professional, ...rest } = app
    const { Professional, ...restProfessional } = professional
    const professionalData = Professional ?? {}

    const isNewPatient = !existingPatientIds.has(app.patientId)

    return {
      ...rest,
      ...professionalData,
      isNewPatient,
      professional: restProfessional,
    }
  })

  return {
    data: mappedAppointments as any,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  }
}
