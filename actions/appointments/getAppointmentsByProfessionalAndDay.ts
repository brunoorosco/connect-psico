"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { AppointmentModel } from "@/domain/model/appointment"

type TParams = {
  selectedDate: Date
}

type Response = {
  data: AppointmentModel[]
}

export const getAppointmentsByDay = async ({ selectedDate }: TParams): Promise<Response> => {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const isPatient = session.user.role === "DEFAULT"
  if (isPatient) throw "Não Autorizado para Paciente"

  const startOfDay = new Date(selectedDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(selectedDate)
  endOfDay.setHours(23, 59, 59, 999)

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: session.user.id, // Filtra apenas agendamentos do profissional logado
      appointmentDate: {
        gte: startOfDay, // maior ou igual ao início do dia
        lte: endOfDay, // menor ou igual ao fim do dia
      },
    },
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
    },
  })

  // 🔹 Opcional: otimizar a busca de pacientes já existentes
  const patientIds = appointments.map((a) => a.patientId)
  const existingPatients = await prisma.pacientes.findMany({
    where: {
      patientId: { in: patientIds },
      professionalId: session.user.id,
    },
    select: { patientId: true },
  })

  const existingPatientIds = new Set(existingPatients.map((p) => p.patientId))

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
  }
}
