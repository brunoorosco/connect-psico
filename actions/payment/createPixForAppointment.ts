"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { env } from "@/config/application"
import { AsaasService } from "@/infra/payments/asaas"
import { withIdem } from "@/infra/db/repositories/idempotency"
import { sendMediaApiWhatsapp, sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { delay } from "@/utils/delay"
import { format } from "date-fns"

const CreatePaymentSchema = z.object({
  appointmentId: z.number().int(),
  amountCents: z.number().int().positive(),
  idempotencyKey: z.string().min(12),
})

type PixPaymentResult = {
  checkoutUrl: string | null
  qrCodeText: string | null
  providerPaymentId: string
  type: "PIX"
}

const sanitizeTaxId = (value?: string | null) => {
  if (!value) return null
  const digits = value.replace(/\D/g, "")
  if (digits.length === 11 || digits.length === 14) return digits
  return null
}

async function ensureAsaasCustomer(userId: string, asaasService: AsaasService) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, asaasCustomerId: true },
  })
  if (!user) throw new Error("Paciente não encontrado para gerar o pagamento")

  if (user.asaasCustomerId) {
    return user.asaasCustomerId
  }

  const patientProfile = await prisma.pacientes.findFirst({
    where: { patientId: userId },
    select: { medicalRecordId: true },
  })

  const taxId =
    sanitizeTaxId(patientProfile?.medicalRecordId) ??
    sanitizeTaxId(user.phone) ??
    sanitizeTaxId(env.asaasFallbackTaxId) ??
    "00000000000"

  const customer = await asaasService.criarCliente({
    name: user.name,
    email: user.email,
    cpfCnpj: taxId,
    phone: user.phone ?? undefined,
    mobilePhone: user.phone ?? undefined,
    externalReference: user.id,
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { asaasCustomerId: customer.id },
  })

  return customer.id
}

const extractBase64 = (encoded?: string | null) => {
  if (!encoded) return null
  const [, data] = encoded.split(",")
  return data ?? encoded
}

const notifyPatientWithPix = async ({
  patientName,
  patientEmail,
  patientPhone,
  qrCodeText,
  qrCodeBase64,
  amountCents,
  expiresAt,
}: {
  patientName: string
  patientEmail: string
  patientPhone?: string | null
  qrCodeText: string | null
  qrCodeBase64: string | null
  amountCents: number
  expiresAt: Date | null
}) => {
  const amountBRL = (amountCents / 100).toFixed(2).replace(".", ",")
  const expirationLabel = expiresAt
    ? expiresAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : null

  if (patientPhone && qrCodeText) {
    const intro =
      `Olá! Seu *Pagamento via PIX* ✅\n` +
      `💰 Valor: *R$ ${amountBRL}*\n` +
      (expirationLabel ? `⏳ Válido até: ${expirationLabel}\n` : "") +
      `📌 Copie o código PIX abaixo e pague no seu app bancário:\n` +
      `${qrCodeText}`

    await sendMessageApiWhatsapp(patientPhone, intro)

    if (qrCodeBase64) {
      await delay(10)
      await sendMediaApiWhatsapp(patientPhone, "QRCode PIX", qrCodeBase64, false)
    }
  }

  if (patientEmail && qrCodeText && qrCodeBase64) {
    await sendEmail({
      to: patientEmail,
      subject: "💳 Pagamento da sua consulta via PIX",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
          <p style="font-size: 16px;">Olá <strong>${patientName}</strong>,</p>
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
              href="https://psicomais.com/copy?code=${encodeURIComponent(qrCodeText)}"
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
          content: Buffer.from(qrCodeBase64, "base64"),
          cid: "qrcodepix",
        },
      ],
    })
  }
}

export async function createPixForAppointment(input: z.infer<typeof CreatePaymentSchema>): Promise<PixPaymentResult> {
  const { appointmentId, amountCents, idempotencyKey } = CreatePaymentSchema.parse(input)

  const asaasService = new AsaasService({
    apiKey: env.apikeyASAAS!,
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  })

  return withIdem(`pix:create:${idempotencyKey}`, async () => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, professional: true },
    })
    if (!appointment) throw new Error("Appointment not found")
    if (appointment.status !== "PENDING") throw new Error("Estado inválido")

    const cents = appointment.priceCents || amountCents
    const valueBRL = Number((cents / 100).toFixed(2))
    const dueDate = format(appointment.appointmentDate, "yyyy-MM-dd")

    const customerId = await ensureAsaasCustomer(appointment.patientId, asaasService)

    const charge: any = await asaasService.criarCobrancaPix({
      customer: customerId,
      value: valueBRL,
      dueDate,
      description: `Consulta com ${appointment.professional.name}`,
      externalReference: `appointment:${appointment.id}`,
    })

    const pixPayload = charge.pix?.payload ?? null
    const pixImage = extractBase64(charge.pix?.encodedImage ?? null)
    const expiration = charge.pix?.expirationDate ? new Date(charge.pix.expirationDate) : null

    const paymentData = {
      appointmentId: appointment.id,
      status: "PENDING" as const,
      provider: "asaas",
      providerPaymentId: charge.id,
      checkoutUrl: charge.invoiceUrl ?? charge.paymentLink ?? charge.paymentUrl ?? null,
      qrCodeText: pixPayload,
      expiresAt: expiration,
      type: "PIX" as const,
      amountCents: cents,
    }

    await prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      create: paymentData,
      update: paymentData,
    })

    await notifyPatientWithPix({
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      patientPhone: appointment.patient.phone,
      qrCodeText: pixPayload,
      qrCodeBase64: pixImage,
      amountCents: cents,
      expiresAt: expiration,
    })

    return {
      checkoutUrl: paymentData.checkoutUrl,
      qrCodeText: pixPayload,
      providerPaymentId: charge.id,
      type: "PIX",
    }
  })
}
