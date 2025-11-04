"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { fromZonedTime } from "date-fns-tz"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { endOfDay, startOfDay } from "date-fns"
import { randomUUID } from "crypto"
import { createPixForAppointment } from "../payment/createPixForAppointment"
import { auth } from "@/auth"

const TZ = "America/Sao_Paulo"

const CreateAppointmentSchema = z.object({
  professionalId: z.string(),
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
})

export const createAppointment = async (data: z.infer<typeof CreateAppointmentSchema>) => {
  const valid = await CreateAppointmentSchema.safeParseAsync(data)
  if (!valid.success) {
    return { error: "Dados inválidos" }
  }

  const { professionalId, patientId, appointmentDate } = valid.data
  const appointmentUtc = fromZonedTime(appointmentDate, TZ)

  const session = await auth()

  try {
    // 1. Verificar disponibilidade do profissional no dia/hora
    const dayOfWeek = appointmentDate.getDay()
    const availability = await prisma.availability.findFirst({
      where: {
        professionalId,
        // dayOfWeek,
        isAvailable: true,
        startTime: { lte: appointmentUtc },
        endTime: { gte: appointmentUtc },
      },
    })

    if (!availability) {
      return { error: "Profissional não disponível neste horário" }
    }
    const start = startOfDay(appointmentDate)
    const end = endOfDay(appointmentDate)

    // 2. Verificar se já existe agendamento neste horário

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          // 1️⃣ Paciente já tem agendamento neste dia
          {
            patientId,
            appointmentDate: {
              gte: start,
              lte: end,
            },
          },
          // 2️⃣ Mesmo profissional já tem agendamento neste horário exato
          {
            professionalId,
            appointmentDate: appointmentDate,
          },
        ],
      },
    })

    if (existingAppointment) {
      return { error: "Já existe um agendamento pra este dia" }
    }
    // 3. Criar agendamento
    const [appointment, prePayment] = await Promise.all([
      prisma.appointment.create({
        data: { professionalId, patientId, appointmentDate, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        select: { id: true, professional: { select: { Professional: { select: { valorAtendimento: true } } } } },
      }),
      prisma.bankAccount.findFirst({ where: { userId: professionalId }, select: { prepaymentEnabled: true } }),
    ])

    if (prePayment) {
      const idempotency = await prisma.idempotencyKey.create({ data: { key: randomUUID() } })
      await createPixForAppointment({
        amountBRL: appointment.professional.Professional?.valorAtendimento as number,
        appointmentId: appointment.id,
        idempotencyKey: idempotency.key,
        patient: {
          name: session?.user.name as string,
          email: session?.user.email as string,
          cellphone: session?.user.phone as string,
        },
      })
    }
    return { success: "Agendamento realizado com sucesso", data: appointment }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar agendamento" }
    }

    throw error
  }
}
