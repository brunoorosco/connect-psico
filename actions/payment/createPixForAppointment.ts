"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { abacatePay } from "@/infra/payments/abacatepay"

import { sendMediaApiWhatsapp, sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { withIdem } from "@/infra/db/repositories/idempotency"
import { delay } from "@/utils/delay"

const CreatePaymentSchema = z.object({
  appointmentId: z.number().int(),
  amountBRL: z.number().positive(), // opcional se já salvar priceCents no Appointment
  idempotencyKey: z.string().min(12),
  patient: z.object({
    name: z.string(),
    cellphone: z.string().max(11),
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
      customer: { cellphone: patient.cellphone, email: patient.email, name: patient.name, taxId: "" },
    }) // { id, checkoutUrl, qrCodeText, expiresAt }

    await prisma.payment.create({
      data: {
        appointmentId: app.id,
        status: "PENDING",
        provider: "abacatepay",
        providerPaymentId: resp.data.id,
        qrCodeText: resp.data.brCode,
        expiresAt: resp.data.expiresAt ? new Date(resp.data.expiresAt) : null,
        amountCents,
      },
    })

    const base64Data = resp.data.brCodeBase64.replace(/^data:image\/\w+;base64,/, "")

    // notificar paciente
    const when = new Date(resp.data.expiresAt)
    const date = when.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    const msg1 =
      `Olá! Seu *Pagamento via PIX* ✅\n` +
      `💰 Valor: *R$ ${(resp.data.amount / 100).toFixed(2).replace(".", ",")}*\n` +
      `📝 Descrição: ${resp.data.description}\n` +
      `⏳ Válidade até: ${date}\n` +
      `📌 Copie o código Pix abaixo e pague no seu app bancário:\n`
    const msg2 = `\`\`\`${resp.data.brCode}\`\`\``
    if (app.patient.phone) {
      await sendMessageApiWhatsapp(app.patient.phone, msg1)
      await delay(500)
      await sendMediaApiWhatsapp(app.patient.phone, "QRCode", base64Data, false)
    }

    // ---- ENVIO DE E-MAIL ----
    await sendEmail({
      to: patient.email,
      subject: "💳 Pagamento da sua consulta via PIX",
      html: `
    <p>Olá ${patient.name},</p>
    <p>Segue o QR Code para pagamento:</p>
    <img src="cid:qrcodepix" alt="QR Code PIX" style="max-width: 200px; border-radius: 8px;" />
    <p>Código PIX:</p>
    <pre style="background:#f3f3f3;padding:10px">${resp.data.brCode}</pre>
  `,
      attachments: [
        {
          filename: "pix-qrcode.png",
          content: Buffer.from(base64Data, "base64"),
          cid: "qrcodepix",
        },
      ],
    })

    return { checkoutUrl: "", qrCodeText: resp.data.brCode }
  })
}
