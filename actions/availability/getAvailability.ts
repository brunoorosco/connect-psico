// src/actions/getAvailability.ts
"use server"

import { prisma } from "@/lib/db"
import { endOfMonth, startOfMonth, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface TimeSlot {
  id: string
  startTime: string // formato: "HH:mm"
  endTime: string // formato: "HH:mm"
}

export interface WeeklySchedule {
  dayOfWeek: number // 0 (Domingo) a 6 (Sábado)
  timeSlots: TimeSlot[]
}

export interface DayAvailability {
  date: string // formato: "yyyy-MM-dd"
  timeSlots: TimeSlot[]
}

function toLocalTime(date: Date): string {
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000) // força -3h
  return local.toISOString().substring(11, 16) // HH:mm
}

export async function getDayAvailabilitiesForMonth(
  professionalId: string,
  dateRef: Date // <- mês selecionado
): Promise<DayAvailability[]> {
  const start = startOfMonth(dateRef)
  const end = endOfMonth(dateRef)

  const raw = await prisma.availability.findMany({
    where: {
      professionalId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { startTime: "asc" },
  })

  console.log("getAvailability.ts:37", raw)

  const groupedByDate = raw.reduce((acc, item) => {
    // 🔹 Agrupa pela data no timezone do servidor
    const dateKey = format(item.startTime, "yyyy-MM-dd", { locale: ptBR })

    if (!acc[dateKey]) acc[dateKey] = []

    const timeSlot: TimeSlot = {
      id: `${item.id}`,
      startTime: item.startTime.toISOString().split("T")[1].slice(0, 5), // "HH:mm"
      endTime: item.endTime.toISOString().split("T")[1].slice(0, 5), // "HH:mm"
    }
    console.log("teste:", format(item.startTime, "HH:mm"), item.startTime)
    acc[dateKey].push(timeSlot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const response = Object.entries(groupedByDate).map(([date, timeSlots]) => ({
    date,
    timeSlots,
  }))
  console.log("getAvailability.ts:66", response)
  return response
}
