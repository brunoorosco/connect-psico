"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { auth } from "@/auth"
import { UpdateAvailabilityByDateSchema } from "./schemas/updateAvalability"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"

const TZ = "America/Sao_Paulo"

// Converte "YYYY-MM-DD" + "HH:mm" (parede São Paulo) -> Date em UTC
function wallTimeToUtc(dateStr: string, hhmm: string) {
  return fromZonedTime(new Date(`${dateStr}T${hhmm}:00.000`), TZ)
}

// Início/fim do dia local (00:00..23:59:59.999) convertidos para UTC
function dayRangeUtc(dateStr: string) {
  const startUtc = fromZonedTime(new Date(`${dateStr}T00:00:00.000`), TZ)
  const endUtc   = fromZonedTime(new Date(`${dateStr}T23:59:59.999`), TZ)
  return { startUtc, endUtc }
}

// dayOfWeek (0=Dom .. 6=Sáb) no calendário de São Paulo
function getDayOfWeekLocal(dateStr: string) {
  // UTC equivalente à meia-noite local
  const startUtc = fromZonedTime(new Date(`${dateStr}T00:00:00.000`), TZ)
  // 'i' = ISO day of week (1=Seg .. 7=Dom). Mapeia para 0=Dom..6=Sáb
  const iso = Number(formatInTimeZone(startUtc, TZ, "i")) // 1..7
  return iso % 7 // 7->0 (Dom), 1->1 (Seg), ..., 6->6 (Sáb)
}

export const updateAvailabilityByDate = async (params: z.infer<typeof UpdateAvailabilityByDateSchema>) => {
  const valid = await UpdateAvailabilityByDateSchema.safeParseAsync(params)
  if (!valid.success) return { error: "Dados inválidos" }

  const session = await auth()
  if (!session?.user?.id) return { error: "Usuário não autenticado" }

  const { date, timeSlots } = valid.data

  try {
    const { startUtc, endUtc } = dayRangeUtc(date)

    // 1) remove tudo do dia (para esse profissional)
    await prisma.availability.deleteMany({
      where: {
        professionalId: session.user.id,
        startTime: { gte: startUtc, lt: endUtc },
      },
    })

    // 2) se não há slots, acabou (equivale a “limpar o dia”)
    if (timeSlots.length === 0) {
      return { success: "Disponibilidade do dia atualizada (vazia)", data: { count: 0 } }
    }

    // 3) recria os slots
    const dayOfWeek = getDayOfWeekLocal(date)

    // dedup simples por par start-end
    const seen = new Set<string>()
    const records: Array<{
      professionalId: string
      dayOfWeek: number
      startTime: Date
      endTime: Date
      isAvailable: boolean
    }> = []

    for (const s of timeSlots) {
      const key = `${s.startTime}-${s.endTime}`
      if (seen.has(key)) continue
      seen.add(key)

      // Converte os horários de parede (São Paulo) para UTC correto
      const startDT = wallTimeToUtc(date, s.startTime)
      const endDT   = wallTimeToUtc(date, s.endTime)

      // guarda a segurança extra, embora já validado no schema
      if (!(startDT instanceof Date) || isNaN(startDT.valueOf())) {
        return { error: `Horário inválido: ${s.startTime}` }
      }
      if (!(endDT instanceof Date) || isNaN(endDT.valueOf())) {
        return { error: `Horário inválido: ${s.endTime}` }
      }
      if (startDT >= endDT) {
        return { error: `Início deve ser menor que fim: ${s.startTime} - ${s.endTime}` }
      }

      records.push({
        professionalId: session.user.id,
        dayOfWeek,
        startTime: startDT, // UTC no banco
        endTime: endDT,     // UTC no banco
        isAvailable: true,
      })
    }

    if (records.length === 0) {
      return { success: "Disponibilidade do dia atualizada (vazia)", data: { count: 0 } }
    }

    await prisma.availability.createMany({ data: records })

    return { success: "Disponibilidade do dia atualizada com sucesso" }
  } catch (error) {
    console.error("Error Disponibilidade", error)
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao atualizar disponibilidade" }
    }
    throw error
  }
}
