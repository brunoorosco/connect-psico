"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { env } from "@/config/application"
import { AsaasService } from "@/infra/payments/asaas"
import { withIdem } from "@/infra/db/repositories/idempotency"
import { sendMessageApiWhatsapp } from "@/infra/httpClient/chatzMessageApi"
import { sendEmail } from "@/infra/email/sendEmail"
import { format } from "date-fns"

const CreateCreditPaymentSchema = z.object({
  appointmentId: z.number().int(),
  amountCents: z.number().int().positive(),
  idempotencyKey: z.string().min(12),
})

type CreditPaymentResult = {
  checkoutUrl: string | null
  providerPaymentId: string
  type: "CREDIT_CARD"
}

const resolveCheckoutUrl = (payload: any) => {
  return payload?.url ?? payload?.paymentLink ?? payload?.paymentUrl ?? payload?.link ?? null
}

const notifyPatientWithLink = async ({
  patientName,
  patientEmail,
  patientPhone,
  checkoutUrl,
  consultationDate,
}: {
  patientName: string
  patientEmail: string
  patientPhone?: string | null
  checkoutUrl: string | null
  consultationDate: string
}) => {
  if (!checkoutUrl) return

  const message =
    `💳 Pagamento pendente!\n` +
    `Finalize o agendamento da sua consulta em ${consultationDate} utilizando o link seguro abaixo:\n${checkoutUrl}`

  if (patientPhone) {
    await sendMessageApiWhatsapp(patientPhone, message)
  }

  if (patientEmail) {
    await sendEmail({
      to: patientEmail,
      subject: "Finalize o pagamento da sua consulta",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
          <p style="font-size: 16px;">Olá <strong>${patientName}</strong>,</p>
          <p style="font-size: 15px;">
            Para confirmar sua consulta em <strong>${consultationDate}</strong>, finalize o pagamento clicando no botão abaixo:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a
              href="${checkoutUrl}"
              style="
                display: inline-block;
                padding: 14px 24px;
                background: #22c55e;
                color: #fff;
                font-size: 15px;
                font-weight: bold;
                border-radius: 8px;
                text-decoration: none;
              "
              target="_blank"
            >
              Pagar com cartão
            </a>
          </div>
          <p style="font-size: 14px; color: #555; text-align: center;">
            Caso já tenha efetuado o pagamento, desconsidere este aviso.
          </p>
        </div>
      `,
    })
  }
}

export async function createCreditPaymentLink(
  input: z.infer<typeof CreateCreditPaymentSchema>
): Promise<CreditPaymentResult> {
  const { appointmentId, amountCents, idempotencyKey } = CreateCreditPaymentSchema.parse(input)

  const asaasService = new AsaasService({
    apiKey: env.apikeyASAAS!,
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  })

  return withIdem(`credit:create:${idempotencyKey}`, async () => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, professional: true },
    })
    if (!appointment) throw new Error("Appointment not found")
    if (appointment.status !== "PENDING") throw new Error("Estado inválido")

    const cents = appointment.priceCents || amountCents
    const valueBRL = Number((cents / 100).toFixed(2))
    const consultationDate = format(appointment.appointmentDate, "dd/MM/yyyy 'às' HH:mm")

    const link: any = await asaasService.criarLinkPagamento({
      name: `Consulta ${appointment.professional.name}`,
      description: `Pagamento da consulta em ${consultationDate}`,
      billingType: "CREDIT_CARD",
      chargeType: "DETACHED",
      value: valueBRL,
      dueDateLimitDays: 1,
      notificationEnabled: true,
    })

    const checkoutUrl = resolveCheckoutUrl(link)

    const paymentData = {
      appointmentId: appointment.id,
      status: "PENDING" as const,
      provider: "asaas",
      providerPaymentId: link.id,
      checkoutUrl,
      qrCodeText: null,
      expiresAt: null,
      type: "CREDIT_CARD" as const,
      amountCents: cents,
    }

    await prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      create: paymentData,
      update: paymentData,
    })

    await notifyPatientWithLink({
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      patientPhone: appointment.patient.phone,
      checkoutUrl,
      consultationDate,
    })

    return {
      checkoutUrl,
      providerPaymentId: link.id,
      type: "CREDIT_CARD",
    }
  })
}
