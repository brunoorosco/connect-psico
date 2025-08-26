"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { auth } from "@/auth"

// HH:mm
const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve estar no formato "HH:mm"')

const TimeSlotSchema = z
  .object({
    id: z.string(), // id gerado no client; não precisamos dele no banco
    startTime: HHMM,
    endTime: HHMM,
  })
  .refine(
    ({ startTime, endTime }) => {
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        return h * 60 + m
      }
      return toMin(startTime) < toMin(endTime)
    },
    { message: "A hora inicial deve ser menor que a final", path: ["endTime"] }
  )

export const UpdateAvailabilityByDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato "yyyy-MM-dd"'),
  timeSlots: z.array(TimeSlotSchema).superRefine((slots, ctx) => {
    // checar sobreposição entre slots
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + m
    }
    const sorted = [...slots].sort((a, b) => toMin(a.startTime) - toMin(b.startTime))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      if (toMin(cur.startTime) < toMin(prev.endTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Conflito entre ${prev.startTime}-${prev.endTime} e ${cur.startTime}-${cur.endTime}`,
          path: ["timeSlots", i, "startTime"],
        })
        break
      }
    }
  }),
})

// cria Date UTC equivalente a 00:00 no fuso -03 + HH:mm
function makeUtcFromLocal(dateStr: string, hhmm: string, offsetHours = -3) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const [hh, mm] = hhmm.split(":").map(Number)
  const utcHour = hh - offsetHours // se offset=-3 => soma 3h
  return new Date(Date.UTC(y, m - 1, d, utcHour, mm, 0, 0))
}

// início do dia local (00:00) em UTC e início do próximo dia local (00:00) em UTC
function dayRangeUtc(dateStr: string) {
  const startUtc = makeUtcFromLocal(dateStr, "00:00", -3)
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
        professionalId: session?.user.id,
        dayOfWeek,
        startTime: startDT,
        endTime: endDT,
        isAvailable: true, // se o modelo tiver esse campo
      })
    }

    if (records.length === 0) {
      return { success: "Disponibilidade do dia atualizada (vazia)", data: { count: 0 } }
    }

    // const data = await prisma.availability.createMany({ data: records })

    return { success: "Disponibilidade do dia atualizada com sucesso" }
  } catch (error) {
    console.error("", error)
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao atualizar disponibilidade" }
    }
    throw error
  }
}
