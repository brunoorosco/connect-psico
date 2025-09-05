import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAbacateSignature } from "@/infra/payments/abacatepay"

import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { withIdem } from "@/infra/db/repositories/idempotency"

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get("x-abacatepay-signature") || ""

  if (!verifyAbacateSignature(raw, sig)) {
    return new NextResponse("invalid signature", { status: 401 })
  }

  const evt = JSON.parse(raw) as { id: string; type: string; data: any; createdAt: string }

  await withIdem(`abacate:${evt.id}`, async () => {
    if (evt.type === "payment.paid") {
      const providerPaymentId = evt.data.id as string

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
            data: { status: "PAID", paidAt: new Date(evt.createdAt) },
          })
          await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: "CONFIRMED" },
          })
        })

        const app = payment.appointment
        const date = app.appointmentDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

        // notifica profissional
        // await sendEmail(app.professional.email, "Nova consulta confirmada", `<p>Consulta em ${date}</p>`)
        if (app.professional.phone)
          await sendMessageApiWhatsapp(app.professional.phone, `Consulta confirmada em ${date}.`)

        // notifica paciente
        // await sendEmail(
        //   app.patient.email,
        //   "Pagamento confirmado",
        //   `<p>Seu pagamento foi confirmado. Consulta em ${date}.</p>`
        // )
        if (app.patient.phone)
          await sendMessageApiWhatsapp(app.patient.phone, `Pagamento confirmado! Consulta em ${date}.`)
      }
    }

    // você pode tratar: payment.refunded, payout.paid, etc.
  })

  return NextResponse.json({ ok: true })
}
