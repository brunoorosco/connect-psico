// src/actions/getAvailability.ts
"use server"

import { prisma } from "@/lib/db"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

export interface TimeSlot {
  id: string
  startTime: string // "HH:mm" em America/Sao_Paulo
  endTime: string // "HH:mm" em America/Sao_Paulo
}

export interface WeeklySchedule {
  dayOfWeek: number // 0 (Domingo) a 6 (Sábado)
  timeSlots: TimeSlot[]
}

export interface DayAvailability {
  date: string // "yyyy-MM-dd" em America/Sao_Paulo
  timeSlots: TimeSlot[]
}

const TZ = "America/Sao_Paulo"

// Calcula [início do mês local 00:00, início do próximo mês local 00:00) em UTC
function monthLocalUtcRange(dateRef: Date) {
  const y = dateRef.getFullYear()
  const m = dateRef.getMonth() // 0..11

  const firstLocal = new Date(y, m, 1)
  const nextLocal = new Date(y, m + 1, 1)

  const firstLocalYMD = formatInTimeZone(firstLocal, TZ, "yyyy-MM-dd")
  const nextLocalYMD = formatInTimeZone(nextLocal, TZ, "yyyy-MM-dd")

  const startUtc = fromZonedTime(new Date(`${firstLocalYMD}T00:00:00.000`), TZ)
  const endUtc = fromZonedTime(new Date(`${nextLocalYMD}T00:00:00.000`), TZ)

  return { startUtc, endUtc }
}

export async function getDayAvailabilitiesForMonth(professionalId: string, dateRef: Date): Promise<DayAvailability[]> {
  const { startUtc, endUtc } = monthLocalUtcRange(dateRef)

  const rows = await prisma.availability.findMany({
    where: {
      professionalId,
      isAvailable: true,
      startTime: { gte: startUtc, lt: endUtc }, // limite superior exclusivo evita duplicações
    },
    select: {
      id: true,
      startTime: true, // Date (UTC)
      endTime: true, // Date (UTC)
    },
    orderBy: { startTime: "asc" },
  })

  // Agrupa por dia LOCAL (São Paulo) e formata HH:mm LOCAL
  const byDay: Record<string, TimeSlot[]> = {}

  for (const r of rows) {
    const dateKey = formatInTimeZone(r.startTime, TZ, "yyyy-MM-dd")
    const startHHmm = formatInTimeZone(r.startTime, TZ, "HH:mm")
    const endHHmm = formatInTimeZone(r.endTime, TZ, "HH:mm")

    const slot: TimeSlot = { id: String(r.id), startTime: startHHmm, endTime: endHHmm }
    ;(byDay[dateKey] ||= []).push(slot)
  }

  return Object.entries(byDay).map(([date, timeSlots]) => ({ date, timeSlots }))
}
