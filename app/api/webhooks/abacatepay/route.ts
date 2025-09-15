import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAbacateSignature } from "@/infra/payments/abacatepay"

import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { withIdem } from "@/infra/db/repositories/idempotency"

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const url = new URL(req.url)
  const secret = url.searchParams.get("webhookSecret")

  if (!verifyAbacateSignature(secret as string)) {
    return new NextResponse("invalid signature", { status: 401 })
  }

  const evt = JSON.parse(raw) as {
    event: string
    data: {
      payment: { amount: number; fee: number; method: string }
      pixQrCode: {
        amount: number
        id: string
        kind: string
        metadata: { cellphone: string; email: string; name: string; taxId: string }
        status: string
      }
    }
    devMode: boolean
  }

  await withIdem(`abacate:${evt.data.pixQrCode.id}`, async () => {
    if (evt.event === "billing.paid" && evt.data.pixQrCode.status === "PAID") {
      const providerPaymentId = evt.data.pixQrCode.id

      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId },
        include: { appointment: { include: { patient: true, professional: true } } },
      })
      if (!payment) return

      // idempotência de estado
      if (payment.status !== "PAID") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "PAID", paidAt: new Date() },
          })
          await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: "CONFIRMED" },
          })
        })

        const app = payment.appointment
        const date = app.appointmentDate.toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        })

        // notifica profissional
        if (app.professional.phone) {
          await sendMessageApiWhatsapp(app.professional.phone, `✅ Consulta confirmada em ${date}.`)
        }

        // notifica paciente
        if (app.patient.phone) {
          await sendMessageApiWhatsapp(
            app.patient.phone,
            `🎉 Pagamento confirmado! Sua consulta está agendada para ${date}.`
          )
        }
      }
    }

    // se precisar, tratar outros eventos: billing.refunded, billing.failed, etc.
  })

  return NextResponse.json({ ok: true })
}
