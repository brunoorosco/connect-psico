"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { fromZonedTime } from "date-fns-tz"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { endOfDay, startOfDay } from "date-fns"
import { auth } from "@/auth"

const TZ = "America/Sao_Paulo"

const RescheduleAppointmentSchema = z.object({
  appointmentId: z.number(),
  newAppointmentDate: z.coerce.date(),
})

export const rescheduleAppointment = async (data: z.infer<typeof RescheduleAppointmentSchema>) => {
  const valid = await RescheduleAppointmentSchema.safeParseAsync(data)
  if (!valid.success) {
    return { error: "Dados inválidos" }
  }

  const { appointmentId, newAppointmentDate } = valid.data
  const newAppointmentUtc = fromZonedTime(newAppointmentDate, TZ)

  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado" }
  }

  try {
    // 1. Buscar o agendamento existente e verificar se existe e está pago
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: {
          select: {
            id: true,
            Professional: {
              select: {
                valorAtendimento: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!existingAppointment) {
      return { error: "Agendamento não encontrado" }
    }

    // Verificar se o agendamento está pago
    if (existingAppointment.status !== "CONFIRMED") {
      return { error: "Apenas agendamentos pagos podem ser reagendados" }
    }

    // Verificar se o usuário é o profissional ou o paciente
    const isProfessional = existingAppointment.professionalId === session.user.id
    const isPatient = existingAppointment.patientId === session.user.id

    if (!isProfessional && !isPatient) {
      return { error: "Você não tem permissão para reagendar este agendamento" }
    }

    // 2. Verificar disponibilidade do profissional no novo horário
    const dayOfWeek = newAppointmentDate.getDay()
    const availability = await prisma.availability.findFirst({
      where: {
        professionalId: existingAppointment.professionalId,
        isAvailable: true,
        startTime: { lte: newAppointmentUtc },
        endTime: { gte: newAppointmentUtc },
      },
    })

    if (!availability) {
      return { error: "Profissional não disponível neste horário" }
    }

    const start = startOfDay(newAppointmentDate)
    const end = endOfDay(newAppointmentDate)

    // 3. Verificar se já existe agendamento no novo horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        id: { not: appointmentId }, // Excluir o agendamento atual
        OR: [
          // Paciente já tem agendamento neste dia
          {
            patientId: existingAppointment.patientId,
            appointmentDate: {
              gte: start,
              lte: end,
            },
            status: { in: ["PENDING", "CONFIRMED"] }, // Apenas agendamentos ativos
          },
          // Profissional já tem agendamento neste horário exato
          {
            professionalId: existingAppointment.professionalId,
            appointmentDate: newAppointmentDate,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        ],
      },
    })

    if (conflictingAppointment) {
      return { error: "Já existe um agendamento para este dia/horário" }
    }

    // 4. Atualizar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: newAppointmentUtc,
        status: "CONFIRMED", // Manter como confirmado já que estava pago
        updatedAt: new Date(),
      },
      include: {
        professional: {
          select: {
            name: true,
            Professional: {
              select: {
                valorAtendimento: true,
              },
            },
          },
        },
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // 5. Registrar o histórico de reagendamento (opcional)
    await prisma.appointmentHistory.create({
      data: {
        appointmentId,
        action: "RESCHEDULED",
        previousDate: existingAppointment.appointmentDate,
        newDate: newAppointmentUtc,
        performedBy: session.user.id,
        performedAt: new Date(),
      },
    })

    // TODO: Enviar notificações por email/SMS para paciente e profissional
    // TODO: Atualizar calendário/agenda do profissional

    return {
      success: "Agendamento reagendado com sucesso",
      data: {
        id: updatedAppointment.id,
        newDate: updatedAppointment.appointmentDate,
        professional: updatedAppointment.professional.name,
        patient: updatedAppointment.patient.name,
      },
    }
  } catch (error) {
    console.error("Erro ao reagendar:", error)

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Agendamento não encontrado" }
      }
      return { error: "Erro ao reagendar agendamento" }
    }

    throw error
  }
}
