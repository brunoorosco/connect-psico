"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export const getAppointmentsByNotReview = async () => {
  const session = await auth()
  if (!session) {
    throw new Error("User not found")
  }

  const users = await prisma.appointment.findMany({
    where: {
      patientId: session.user.id,
      review: false,
      // appointmentDate: { gte: new Date() },
      status: "CONCLUDED",
    },
    select: {
      id: true,
      appointmentDate: true,
      professional: {
        select: {
          name: true,
          id: true
        },
      },
    },
  })

  return users
}
