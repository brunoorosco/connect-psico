"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { TIME_REGEX } from "@/utils/formatMessageTime"
import { auth } from "@/auth"

const CreateAppointmentSchema = z.object({
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
  startTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  endTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  notes: z.string().optional(),
})

export const addAppointmentByProfessional = async (data: z.infer<typeof CreateAppointmentSchema>) => {
  console.log(data)
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
    console.log("chegou aqui")
    if (!professionalId) return

   
    const appointment = await prisma.appointment.create({
      data: { professionalId, patientId, appointmentDate },
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
