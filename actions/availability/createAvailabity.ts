"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"

const TZ = "America/Sao_Paulo"

/**
 * Mapeia dayOfWeek (0=domingo..6=sábado) para uma data-âncora estável na mesma semana.
 * Aqui usamos a semana de 1970-01-04 (domingo) a 1970-01-10 (sábado).
 */
function anchorDateForDow(dayOfWeek: number): string {
  const base = new Date(Date.UTC(1970, 0, 4)) // 1970-01-04T00:00:00Z (domingo)
  const d = new Date(base.getTime() + dayOfWeek * 24 * 60 * 60 * 1000)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}` // "YYYY-MM-DD"
}

type TimeSlotInput = { startTime: string; endTime: string } // "HH:mm" (mantido aqui só como referência)
type DayAvailabilityInput = {
  professionalId: string
  date: string // "YYYY-MM-DD" (dia em São Paulo) - não usado neste create recorrente
  timeSlots: TimeSlotInput[]
}

const CreateAvailabilitySchema = z.object({
  professionalId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  // continuam sendo Date, como no seu contrato atual
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
})

export const createAvailability = async (data: z.infer<typeof CreateAvailabilitySchema>) => {
  const valid = await CreateAvailabilitySchema.safeParseAsync(data)
  if (!valid.success) return { error: "Dados inválidos" }

  const { professionalId, dayOfWeek, startTime, endTime } = valid.data
  console.log("[createAvailabity.ts:43]", { startTime, endTime })

  // 1) Extrai "HH:mm" interpretando SEMPRE em America/Sao_Paulo (evita depender do fuso do servidor)
  const startHHmm = formatInTimeZone(startTime, TZ, "HH:mm")
  const endHHmm = formatInTimeZone(endTime, TZ, "HH:mm")
  console.log("[createAvailabity.ts:48]", { startHHmm, endHHmm })
  // (validação simples: não permitir atravessar meia-noite)
  if (startHHmm >= endHHmm) {
    return { error: "Hora de início deve ser antes da hora de término" }
  }

  // 2) Constrói uma data-âncora para o dia da semana e converte para UTC (valor que iremos salvar)
  const anchor = anchorDateForDow(dayOfWeek) // ex.: "1970-01-06" (terça)
  const startUtc = fromZonedTime(new Date(`${anchor}T${startHHmm}:00`), TZ)
  const endUtc = fromZonedTime(new Date(`${anchor}T${endHHmm}:00`), TZ)
  console.log("[createAvailabity.ts:58]", { startUtc, endUtc })
  try {
    // 3) Verificar sobreposição usando os valores UTC normalizados
    const overlapping = await prisma.availability.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isAvailable: true,
        // Conflito clássico de intervalo [start, end):
        // existe se startA < endB E endA > startB
        startTime: { lt: endUtc },
        endTime: { gt: startUtc },
      },
    })

    if (overlapping) {
      return { error: "Já existe uma disponibilidade que conflita com este horário" }
    }

    // 4) Criar disponibilidade salvando em UTC
    const availability = await prisma.availability.create({
      data: {
        professionalId,
        dayOfWeek,
        startTime: startUtc, // DateTime (UTC no banco)
        endTime: endUtc, // DateTime (UTC no banco)
        isAvailable: true,
      },
    })

    return { success: "Disponibilidade cadastrada com sucesso", data: availability }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" }
    }
    throw error
  }
}
