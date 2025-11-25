"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const paymentCache = new Map<string, any>()

export async function getPaymentsByPatient() {
  const session = await auth()
  const userId = session?.user.id
  if (!userId) return

  // Se já estiver no cache, retorna imediatamente
  if (paymentCache.has(userId)) {
    return paymentCache.get(userId)
  }

  const data = await prisma.payment.findMany({
    where: { appointment: { patientId: userId } },
    select: {
      appointment: {
        select: { professional: { select: { name: true } }, appointmentDate: true, id: true, payment: true },
      },
    },
    orderBy: {
      appointment: {
        appointmentDate: "desc",
      },
    },
  })

  // Se estiver pago → salva para sempre no cache
  // if (data?.status === "PAID") {
  //   paymentCache.set(userId, data)
  // }

  return data.map((item) => item.appointment)
}
