"use server"
import { env } from "@/config/application"
import { prisma } from "@/lib/db"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"

type Interval = { start: Date; end: Date }
const DEFAULT_DURATION_MINUTES = 60

function getFreeIntervals(availability: Interval, appointments: Interval[]): Interval[] {
  let freeIntervals: Interval[] = []
  let currentStart = availability.start

  const sortedAppointments = appointments
    .filter((app) => app.end > availability.start && app.start < availability.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  for (const appointment of sortedAppointments) {
    if (currentStart < appointment.start) {
      freeIntervals.push({ start: currentStart, end: appointment.start })
    }
    currentStart = appointment.end > currentStart ? appointment.end : currentStart
  }

  if (currentStart < availability.end) {
    freeIntervals.push({ start: currentStart, end: availability.end })
  }

  return freeIntervals
}

export const getProfessionalSchedule = async (userId: number, date: Date) => {
  const dayOfWeek = date.getDay() // 0=domingo, 1=segunda, etc.
  const professional = await prisma.professional.findUnique({
    where: { id: userId, user: { active: true } },
    select: { id: true, userId: true },
  })

  if (!professional) throw new Error("Profissional não encontrado")

  const availabilities = await prisma.availability.findMany({
    where: {
      professionalId: professional.userId,
      // dayOfWeek,
      isAvailable: true,
      startTime: {
        gte: new Date(), // pega horários >= agora
      }, // busca apenas horários futuros (>= agora)
    },
  })

  // Constrói YYYY-MM-DD da data selecionada, segundo São Paulo
  const ymd = formatInTimeZone(date, env.timezone, "yyyy-MM-dd")
  // 00:00 e 23:59:59.999 em São Paulo, convertidos para UTC (Date)
  const startOfDay = fromZonedTime(new Date(`${ymd}T00:00:00`), env.timezone)
  const endOfDay = fromZonedTime(new Date(`${ymd}T23:59:59.999`), env.timezone)

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: professional.userId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: "CANCELLED",
      },
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING",
          // expiresAt: {
          //   gt: new Date(), // só considerar pendentes ainda válidos
          // },
        },
      ],
    },
  })
  console.debug("app::", appointments)
  if (availabilities.length === 0) {
    return []
  }

  // Transformar appointments em Interval[]
  const appointmentIntervals = appointments.map((app) => {
    const start = app.appointmentDate
    const end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000) // Ex: 60 minutos de duração fixa
    return { start, end }
  })

  // Gerar buracos de horários livres
  const freeIntervals = availabilities.flatMap((av) => {
    const startTime = new Date(av.startTime)
    const endTime = new Date(av.endTime)

    const start = new Date(av.startTime)
    start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)

    const end = new Date(av.startTime)
    end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)

    return getFreeIntervals({ start, end }, appointmentIntervals)
  })

  // Explodir em slots de 60 minutos
  const slots = freeIntervals.flatMap((interval) => {
    const slotsInInterval: { start: Date }[] = []
    let current = new Date(interval.start)
    const end = new Date(interval.end)

    while (current < end) {
      slotsInInterval.push({ start: new Date(current) })
      current = new Date(current.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000) // adiciona 60 min
    }
    return slotsInInterval
  })

  console.debug("solts::::", slots)

  const slotsUnique = Array.from(new Set(slots.map((item) => item.start.toISOString()))).map((start) => ({
    start: new Date(start),
  })) // mantém UTC, sem offset manual
  console.debug("120 Unique::::", slotsUnique)

  const slotsOrdened = slotsUnique
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((s) => ({ start: s.start.toISOString() })) // enviar ISO UTC ao front (ok)
  console.debug("124 Ordenado::::", slotsOrdened)
  return slotsOrdened
}
