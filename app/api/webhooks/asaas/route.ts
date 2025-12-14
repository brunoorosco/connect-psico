import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { env } from "@/config/application"
import { withIdem } from "@/infra/db/repositories/idempotency"
import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"

const PAID_STATUSES = new Set(["RECEIVED", "RECEIVED_IN_CASH", "CONFIRMED"])
const REFUNDED_STATUSES = new Set(["REFUNDED"])
const CANCELED_STATUSES = new Set(["CANCELLED"])

export async function POST(req: NextRequest) {
  const signature = req.headers.get("asaas-signature") ?? req.nextUrl.searchParams.get("secret")

  if (env.asaasWebhookSecret && signature !== env.asaasWebhookSecret) {
    return new NextResponse("unauthorized", { status: 401 })
  }

  const event = await req.json().catch(() => null)

  if (!event?.payment?.id) {
    return NextResponse.json({ ok: true })
  }

  const normalizedStatus = String(event.payment.status || "").toUpperCase()

  await withIdem(`asaas:${event.payment.id}:${normalizedStatus}`, async () => {
    const paymentId = event.payment.id.split("pay_")[1]
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId },
      include: { appointment: { include: { patient: true, professional: true } } },
    })

    if (!payment) {
      return
    }

    if (PAID_STATUSES.has(normalizedStatus)) {
      if (payment.status === "PAID") return

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "CONFIRMED" },
        }),
      ])

      const appointment = payment.appointment
      const date = appointment.appointmentDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

      if (appointment.patient.phone) {
        await sendMessageApiWhatsapp(
          appointment.patient.phone,
          `🎉 Pagamento confirmado! Sua consulta está agendada para ${date}.`
        )
      }

      if (appointment.professional.phone) {
        await sendMessageApiWhatsapp(
          appointment.professional.phone,
          `✅ Consulta confirmada em ${date}. Veja mais detalhes na plataforma.`
        )
      }
    } else if (REFUNDED_STATUSES.has(normalizedStatus)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      })
    } else if (CANCELED_STATUSES.has(normalizedStatus)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELED" },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
