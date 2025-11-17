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

    if (app.patient.phone) {
      await sendMessageApiWhatsapp(app.patient.phone, msg1)
      await delay(10)
      await sendMediaApiWhatsapp(app.patient.phone, "QRCode", base64Data, false)
    }

    // ---- ENVIO DE E-MAIL ----
    await sendEmail({
      to: patient.email,
      subject: "💳 Pagamento da sua consulta via PIX",
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
      <p style="font-size: 16px;">Olá <strong>${patient.name}</strong>,</p>

      <p style="font-size: 15px;">
        Segue abaixo o QR Code para realizar o pagamento da sua sessão:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <img
          src="cid:qrcodepix"
          alt="QR Code PIX"
          style="max-width: 220px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.15);"
        />
      </div>

      <p style="font-size: 15px; text-align: center; margin-bottom: 25px;">
        Caso prefira, você também pode copiar o código PIX do pagamento:
      </p>

      <div style="text-align: center; margin-bottom: 30px;">
        <a
          href="https://psicomais.com/copy?code=${encodeURIComponent(resp.data.brCode)}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background: #4f46e5;
            color: #fff;
            font-size: 15px;
            font-weight: bold;
            border-radius: 8px;
            text-decoration: none;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          "
          target="_blank"
        >
          Copiar código PIX
        </a>
      </div>

      <p style="font-size: 14px; color: #555; text-align: center;">
        Obrigado! Caso já tenha realizado o pagamento, por favor desconsidere esta mensagem.
      </p>
    </div>
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
