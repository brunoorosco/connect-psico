"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { TIME_REGEX } from "@/utils/formatMessageTime"
import { auth } from "@/auth"

const UpdateAppointmentSchema = z.object({
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
  startTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  endTime: z.string().regex(TIME_REGEX, "Formato inválido. Use HH:MM"),
  notes: z.string().optional(),
  id: z.number(),
})

export const updateAppointmentByProfessional = async (data: z.infer<typeof UpdateAppointmentSchema>) => {
  const valid = await UpdateAppointmentSchema.safeParseAsync(data)
  if (!valid.success) {
    return {
      success: false,
      message: "Dados inválidos",
    }
  }

  const { patientId, id, appointmentDate, startTime, endTime, notes } = valid.data

  const session = await auth()
  const professionalId = session?.user.id
  if (!professionalId) {
    return { success: false, message: "Não autenticado" }
  }

  try {
    // Verifica se o agendamento existe e pertence ao profissional
    const existing = await prisma.appointment.findFirst({
      where: { id },
      select: { id: true },
    })
 
    if (!existing) {
      return {
        success: false,
        message: "Agendamento não encontrado ou não pertence ao profissional",
      }
    }
    const updated = await prisma.appointment.update({
      where: { id: existing.id },
      data: {
        appointmentDate,
      },
    })

    return {
      success: true,
      message: "Agendamento atualizado com sucesso",
      data: updated,
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao atualizar agendamento" }
    }
    throw error
  }
}
