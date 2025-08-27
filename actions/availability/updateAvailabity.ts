"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { auth } from "@/auth"
import { UpdateAvailabilityByDateSchema } from "./schemas/updateAvalability"

// cria Date UTC equivalente a 00:00 no fuso -03 + HH:mm
function makeUtcFromLocal(dateStr: string, hhmm: string, offsetHours = -3) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const [hh, mm] = hhmm.split(":").map(Number)
  const utcHour = hh - offsetHours // se offset=-3 => soma 3h
  return new Date(Date.UTC(y, m - 1, d, utcHour, mm, 0, 0))
}

// início do dia local (00:00) em UTC e início do próximo dia local (00:00) em UTC
function dayRangeUtc(dateStr: string) {
  const startUtc = makeUtcFromLocal(dateStr, "00:00")
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000)
  return { startUtc, endUtc }
}

function getDayOfWeek(dateStr: string) {
  // 0=Dom .. 6=Sáb
  return new Date(dateStr + "T00:00:00").getDay()
}

export const updateAvailabilityByDate = async (params: z.infer<typeof UpdateAvailabilityByDateSchema>) => {
  const valid = await UpdateAvailabilityByDateSchema.safeParseAsync(params)
  if (!valid.success) return { error: "Dados inválidos" }
  const session = await auth()
  const { date, timeSlots } = valid.data

  try {
    const { startUtc, endUtc } = dayRangeUtc(date)

    // 1) remove tudo do dia (para esse profissional)
    await prisma.availability.deleteMany({
      where: {
        professionalId: session?.user.id,
        startTime: { gte: startUtc, lt: endUtc },
      },
    })

    // 2) se não há slots, acabou (equivale a “limpar o dia”)
    if (timeSlots.length === 0) {
      return { success: "Disponibilidade do dia atualizada (vazia)", data: { count: 0 } }
    }

    // 3) recria os slots
    const dayOfWeek = getDayOfWeek(date)
    // dedup simples por par start-end
    const seen = new Set<string>()
    const records = []
    
    for (const s of timeSlots) {
      const key = `${s.startTime}-${s.endTime}`
      if (seen.has(key)) continue
      seen.add(key)

      const startDT = makeUtcFromLocal(date, s.startTime, -3)
      const endDT = makeUtcFromLocal(date, s.endTime, -3)

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
        professionalId: session?.user.id as string,
        dayOfWeek,
        startTime: startDT,
        endTime: endDT,
        isAvailable: true, // se o modelo tiver esse campo
      })
    }
    
    console.log('[updateAvailabity.ts:76]', JSON.stringify(records,null,2));
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
