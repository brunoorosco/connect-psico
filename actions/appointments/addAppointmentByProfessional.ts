"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { TIME_REGEX } from "@/utils/formatMessageTime"
import { auth } from "@/auth"
import { createPixForAppointment } from "../payment/createPixForAppointment"
import { randomUUID } from "crypto"

const CreateAppointmentSchema = z.object({
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
  startTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  endTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  notes: z.string().optional(),
})

const prePayment = false

export const addAppointmentByProfessional = async (data: z.infer<typeof CreateAppointmentSchema>) => {
  const valid = await CreateAppointmentSchema.safeParseAsync(data)
  if (!valid.success) {
    return {
      success: false,
      message: "Dados inválidos",
    }
  }

  const { patientId, appointmentDate } = valid.data
  const session = await auth()
  const professionalId = session?.user.id

  try {
    const dayOfWeek = appointmentDate.getDay()
    // 2. Verificar se já existe agendamento neste horário
    // const existingAppointment = await prisma.appointment.findFirst({
    //   where: {
    //     professionalId,
    //     appointmentDate,
    //   },
    // })

    // if (existingAppointment) {
    //   return {
    //     success: false,
    //     message: "Já existe um agendamento neste horário",
    //   }
    // }
    // 3. Criar agendamento

    if (!professionalId) return
    const startOfDay = new Date(appointmentDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(appointmentDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await prisma.appointment.findFirst({
      where: {
        professionalId,
        patientId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { id: true },
    })
    
    if (existing) {
      return {
        success: false,
        message: "Já Existe um Agendamento nesta data",
      }
    }

    const appointment = await prisma.appointment.create({
      data: { professionalId, patientId, appointmentDate },
      select: { id: true, professional: { select: { Professional: { select: { valorAtendimento: true } } } } },
    })
    if (prePayment) {
      const idempotency = await prisma.idempotencyKey.create({ data: { key: randomUUID() } })
      await createPixForAppointment({
        amountCents: appointment.professional.Professional?.valorAtendimento as number,
        appointmentId: appointment.id,
        idempotencyKey: idempotency.key,
      })
    }

    return {
      success: true,
      message: "Agendamento realizado com sucesso",
      data: appointment,
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar agendamento" }
    }

    throw error
  }
}
