"use server"

import { prisma } from "@/lib/db"

export const updateAppointmentStatusReviewRepository = async (id: number) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { review: true },
    })

    if (appointment) {
      return { error: "Já existe um agendamento pra este dia" }
    }

    return { appointment }
  } catch (error) {
    console.error(error)
    throw error
  }
}
