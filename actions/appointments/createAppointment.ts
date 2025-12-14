"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { fromZonedTime } from "date-fns-tz"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { endOfDay, startOfDay } from "date-fns"
import { randomUUID } from "crypto"
import { createPixForAppointment } from "../payment/createPixForAppointment"
import { createCreditPaymentLink } from "../payment/createCreditPaymentLink"

const TZ = "America/Sao_Paulo"

const CreateAppointmentSchema = z.object({
  professionalId: z.string(),
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
  paymentMethod: z.enum(["pix", "credit"]),
})

export const createAppointment = async (data: z.infer<typeof CreateAppointmentSchema>) => {

  const valid = await CreateAppointmentSchema.safeParseAsync(data)
  if (!valid.success) {
    return { error: "Dados inválidos" }
  }

  const { professionalId, patientId, appointmentDate } = valid.data
  const appointmentUtc = fromZonedTime(appointmentDate, TZ)

  try {
    const relation = await prisma.patientProfessional.findFirst({
      where: { patientId, professionalId },
    })

    if (!relation) {
      // cria relação automaticamente
      await prisma.patientProfessional.create({
        data: {
          patientId,
          professionalId,
        },
      })
    }

    // 1. Verificar disponibilidade do profissional no dia/hora
    const dayOfWeek = appointmentDate.getDay()
    const availability = await prisma.availability.findFirst({
      where: {
        professionalId,
        // dayOfWeek,
        isAvailable: true,
        startTime: { lte: appointmentUtc },
        endTime: { gte: appointmentUtc },
      },
    })

    if (!availability) {
      return { error: "Profissional não disponível neste horário" }
    }
    const start = startOfDay(appointmentDate)
    const end = endOfDay(appointmentDate)

    // 2. Verificar se já existe agendamento neste horário

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          // 1️⃣ Paciente já tem agendamento neste dia
          {
            patientId,
            appointmentDate: {
              gte: start,
              lte: end,
            },
          },
          // 2️⃣ Mesmo profissional já tem agendamento neste horário exato
          {
            professionalId,
            appointmentDate: appointmentDate,
          },
        ],
      },
    })

    if (existingAppointment) {
      return { error: "Já existe um agendamento pra este dia" }
    }
    // 3. Preparar informações financeiras e criar agendamento
    const [professionalProfile, prePaymentSettings] = await Promise.all([
      prisma.professional.findUnique({
        where: { userId: professionalId },
        select: { valorAtendimento: true },
      }),
      prisma.bankAccount.findFirst({ where: { userId: professionalId }, select: { prepaymentEnabled: true } }),
    ])

    const priceCents = professionalProfile?.valorAtendimento ?? 0

    if (prePaymentSettings?.prepaymentEnabled && priceCents <= 0) {
      return { error: "Profissional sem valor de atendimento configurado para cobrança antecipada" }
    }

    const appointment = await prisma.appointment.create({
      data: {
        professionalId,
        patientId,
        appointmentDate,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        priceCents,
      },
      select: { id: true },
    })

    let paymentResult: { checkoutUrl?: string | null; qrCodeText?: string | null; type?: "PIX" | "CREDIT_CARD" } | null =
      null

    if (prePaymentSettings?.prepaymentEnabled && priceCents > 0) {
      const idempotency = await prisma.idempotencyKey.create({ data: { key: randomUUID() } })
      const action = data.paymentMethod

      switch (action) {
        case "credit":
          paymentResult = await createCreditPaymentLink({
            amountCents: priceCents,
            appointmentId: appointment.id,
            idempotencyKey: idempotency.key,
          })
          break

        case "pix":
          paymentResult = await createPixForAppointment({
            amountCents: priceCents,
            appointmentId: appointment.id,
            idempotencyKey: idempotency.key,
          })
          break

        default:
          return { success: false, error: "Ação inválida" }
      }
    }
    return { success: "Agendamento realizado com sucesso", data: appointment, payment: paymentResult }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar agendamento" }
    }

    throw error
  }
}
