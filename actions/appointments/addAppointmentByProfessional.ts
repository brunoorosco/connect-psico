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

    const appointment = await prisma.appointment.create({
      data: { professionalId, patientId, appointmentDate },
      select: { id: true, professional: { select: { Professional: { select: { valorAtendimento: true } } } } },
    })

    const idempotency = await prisma.idempotencyKey.create({ data: { key: randomUUID() } })
    await createPixForAppointment({
      amountBRL: appointment.professional.Professional?.valorAtendimento as number,
      appointmentId: appointment.id,
      idempotencyKey: idempotency.key,
      patient: {
        name: session.user.name as string,
        email: session.user.email as string,
        cellphone: session.user.phone as string,
      },
    })

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
