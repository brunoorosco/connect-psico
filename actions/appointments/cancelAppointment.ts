"use server"

import { prisma } from "@/lib/db"
import { abacatePay } from "@/infra/payments/abacatepay"
import { differenceInHours } from "date-fns"
import { auth } from "@/auth"

type By = "PATIENT" | "PROFESSIONAL"

export async function cancelAppointment(appointmentId: number) {
  const session = await auth()
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true, patient: true, professional: true },
  })
  if (!app) throw new Error("Not found")
  if (["CONCLUDED", "CANCELLED"].includes(app.status)) throw new Error("Estado inválido")

  // Atualiza status do agendamento
  await prisma.appointment.update({ where: { id: app.id }, data: { status: "CANCELLED" } })

  // Se não pago, só notifica
  if (!app.payment || app.payment.status !== "PAID") return

  const hours = differenceInHours(app.appointmentDate, new Date()) // tudo UTC OK
  let refundAmount = 0
  let reason: "PRO_CANCEL" | "PATIENT_CANCEL_48H" | "PATIENT_CANCEL_LT48H" = "PRO_CANCEL"

  if (session?.user.role.toUpperCase() === "PROFESSIONAL") {
    refundAmount = app.payment.amountCents // 100%
    reason = "PRO_CANCEL"
  } else {
    if (hours >= 48) {
      refundAmount = app.payment.amountCents // 100%
      reason = "PATIENT_CANCEL_48H"
    } else {
      refundAmount = Math.floor(app.payment.amountCents * 0.5) // 50%
      reason = "PATIENT_CANCEL_LT48H"
      // a outra metade você contabiliza no saldo/payout futuro
    }
  }

  // const r = await abacatePay.refund({
  //   providerPaymentId: app.payment.providerPaymentId!,
  //   amountCents: refundAmount,
  //   reason,
  // })

  // await prisma.refund.create({
  //   data: {
  //     appointmentId: app.id,
  //     amountCents: refundAmount,
  //     reason,
  //     status: "requested",
  //     providerRefundId: r.id,
  //   },
  // })

  // mensagens
  const date = app.appointmentDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  if (session?.user.role.toUpperCase() === "PROFESSIONAL") {
    // avisa paciente do cancelamento + opção de remarcação (você já tem área logada p/ escolher nova data)
  } else {
    // confirma ao paciente o cancelamento e o reembolso (integral ou parcial)
  }
}
