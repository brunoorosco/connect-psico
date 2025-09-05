"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { abacatePay } from "@/infra/payments/abacatepay"

import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { withIdem } from "@/infra/db/repositories/idempotency"

const CreatePaymentSchema = z.object({
  appointmentId: z.number().int(),
  amountBRL: z.number().positive(), // opcional se já salvar priceCents no Appointment
  idempotencyKey: z.string().min(12),
  patient: z.object({
    name: z.string(),
    cellphone: z.string().max(10),
    email: z.string().email(),
  }),
})

export async function createPixForAppointment(input: z.infer<typeof CreatePaymentSchema>) {
  const { appointmentId, amountBRL, idempotencyKey, patient } = CreatePaymentSchema.parse(input)

  return withIdem(`pix:create:${idempotencyKey}`, async () => {
    const app = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, professional: true },
    })
    if (!app) throw new Error("Appointment not found")
    if (app.status !== "PENDING") throw new Error("Estado inválido")

    const amountCents = app.priceCents || Math.round(amountBRL)

    const resp = await abacatePay.createPixCharge({
      amountCents,
      metadata: { appointmentId: app.id },
      customer: { cellphone: "", email: "", name: "", taxId: "" },
    }) // { id, checkoutUrl, qrCodeText, expiresAt }

    await prisma.payment.create({
      data: {
        appointmentId: app.id,
        status: "PENDING",
        provider: "abacatepay",
        providerPaymentId: resp.id,
        checkoutUrl: resp.checkoutUrl,
        qrCodeText: resp.qrCodeText,
        expiresAt: resp.expiresAt ? new Date(resp.expiresAt) : null,
        amountCents,
      },
    })

    // notificar paciente
    const when = app.appointmentDate // UTC
    const date = when.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    const msg = `Olá! Seu pagamento PIX está pronto para a consulta de ${date}. Link: ${resp.checkoutUrl}`
    if (app.patient.phone) await sendMessageApiWhatsapp(app.patient.phone, msg)
    // await sendEmail(app.patient.email, "Pagamento da sua consulta", `<p>${msg}</p>`)

    return { checkoutUrl: resp.checkoutUrl, qrCodeText: resp.qrCodeText }
  })
}
