"use server"

import { prisma } from "@/lib/db"
import { abacatePay } from "@/infra/payments/abacatepay"

const PLATFORM_FEE_PCT = 0.1 // ajuste conforme sua regra

export async function concludeAppointment(appointmentId: number) {
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true, professional: true },
  })
  if (!app) throw new Error("Not found")
  if (app.status !== "CONFIRMED") throw new Error("Estado inválido")

  // valor líquido do profissional
  const gross = app.priceCents
  const net = Math.max(0, gross - Math.round(gross * PLATFORM_FEE_PCT))

  // opcional: acionar payout no AbacatePay
  const payout = await abacatePay.createPayout({
    amountCents: net,
    professionalId: app.professionalId,
  })

  await prisma.$transaction([
    prisma.payout.create({
      data: {
        appointmentId: app.id,
        professionalId: app.professionalId,
        amountCents: net,
        status: "processing",
        providerPayoutId: payout.id,
      },
    }),
    prisma.appointment.update({
      where: { id: app.id },
      data: { status: "CONCLUDED" },
    }),
  ])
}
