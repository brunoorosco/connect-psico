"use server"
import { prisma } from "@/lib/db"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"
import { addDays, startOfWeek as dfStartOfWeek } from "date-fns"

const TZ = "America/Sao_Paulo"
const SLOT_MINUTES = 60
const WORK_START = 8 // 09:00
const WORK_END = 19 // 18:00 (exclusivo; último slot começa 17:00)
const DEFAULT_DURATION_MINUTES = 60 as const

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

type DaySlots = { time: string; available: boolean }[]

type WeeklySchedule = Record<DayKey, DaySlots>

type Interval = { start: Date; end: Date }

/** Constrói [UTC] do início/fim de um dia local (São Paulo) */
function dayRangeUtc(localDate: Date) {
  const ymd = formatInTimeZone(localDate, TZ, "yyyy-MM-dd")
  const start = fromZonedTime(new Date(`${ymd}T00:00:00.000`), TZ)
  const end = fromZonedTime(new Date(`${ymd}T23:59:59.999`), TZ)
  return { start, end }
}

/** Gera slots locais (São Paulo) de 60min entre WORK_START..WORK_END */
function buildBaselineSlotsLocal(dayLocal: Date) {
  const slots: { time: string; startUtc: Date; endUtc: Date }[] = []
  for (let h = WORK_START; h < WORK_END; h += SLOT_MINUTES / 60) {
    const hh = String(h).padStart(2, "0")
    const timeLocal = `${formatInTimeZone(dayLocal, TZ, "yyyy-MM-dd")}T${hh}:00:00`
    const startUtc = fromZonedTime(new Date(timeLocal), TZ)
    const endUtc = new Date(startUtc.getTime() + SLOT_MINUTES * 60 * 1000)
    slots.push({
      time: `${hh}:00`,
      startUtc,
      endUtc,
    })
  }
  return slots
}

/** Subtrai intervalsB (appointments) de intervalA (availability) e retorna "buracos" livres */
function subtractIntervals(intervalA: Interval, intervalsB: Interval[]): Interval[] {
  // Estratégia simples: dividir A por quaisquer sobreposições de B
  // 1) ordenar B por início
  const B = [...intervalsB].sort((x, y) => x.start.getTime() - y.start.getTime())
  let parts: Interval[] = [intervalA]

  for (const b of B) {
    const nextParts: Interval[] = []
    for (const a of parts) {
      const aS = a.start.getTime(),
        aE = a.end.getTime()
      const bS = b.start.getTime(),
        bE = b.end.getTime()

      // sem overlap
      if (bE <= aS || bS >= aE) {
        nextParts.push(a)
        continue
      }

      // recortes
      if (bS > aS) nextParts.push({ start: a.start, end: new Date(bS) })
      if (bE < aE) nextParts.push({ start: new Date(bE), end: a.end })
    }
    parts = nextParts
    if (!parts.length) break
  }

  // descartar vazios
  return parts.filter((p) => p.end.getTime() > p.start.getTime())
}

/** Testa se [slotStart, slotEnd] está contido em algum intervalo livre */
function slotContainedInFree(slot: Interval, free: Interval[]) {
  return free.some((iv) => iv.start.getTime() === slot.start.getTime() && iv.end <= slot.end)
}

/** Mapeia 0..6 (Date.getDay) para keys em inglês começando segunda */
function toDayKey(d: Date): DayKey {
  const day = d.getDay() // 0=Sun..6=Sat
  switch (day) {
    case 1:
      return "monday"
    case 2:
      return "tuesday"
    case 3:
      return "wednesday"
    case 4:
      return "thursday"
    case 5:
      return "friday"
    case 6:
      return "saturday"
    case 0:
      return "sunday"
    default:
      return "monday"
  }
}

/**
 * Grade semanal (segunda→domingo), slots 09:00..17:00, marcando available true/false.
 * - weekStart pode ser qualquer data; será normalizada para a segunda-feira correspondente.
 * - Apenas horários no futuro são elegíveis (não marca `true` para slots já passados).
 */
export async function getProfessionalWeeklySchedule(userId: number, weekStart: Date): Promise<WeeklySchedule> {
  const now = new Date()

  const professional = await prisma.professional.findUnique({
    where: { id: userId, user: { active: true } },
    select: { id: true, userId: true },
  })
  if (!professional) throw new Error("Profissional não encontrado")

  // Normaliza para segunda-feira local
  const mondayLocal = new Date(weekStart.getTime() + 3 * 60 * 60 * 1000)
  // Intervalo da semana (local -> UTC)
  const { start: weekStartUtc } = dayRangeUtc(mondayLocal)
  const { end: weekEndUtc } = dayRangeUtc(addDays(mondayLocal, 6))

  // Busca **toda** a semana de uma vez
  const [availabilities, appointments] = await Promise.all([
    prisma.availability.findMany({
      where: {
        professionalId: professional.userId,
        isAvailable: true,
        // disponibilidade que toca em qualquer ponto da semana:
        // (start < fimDaSemana) AND (end > inicioDaSemana)
        startTime: { lt: weekEndUtc },
        endTime: { gt: weekStartUtc },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.appointment.findMany({
      where: {
        professionalId: professional.userId,
        appointmentDate: {
          gte: weekStartUtc,
          lte: weekEndUtc,
        },
        status: { not: "CANCELLED" },
        OR: [
          { status: "CONFIRMED" },
          { status: "PENDING", expiresAt: { gt: now } }, // só pendentes válidos
        ],
      },
      select: { appointmentDate: true },
    }),
  ])

  // Converte appointments em intervals
  const apptIntervals: Interval[] = appointments.map((a) => {
    const start = a.appointmentDate
    const dur = DEFAULT_DURATION_MINUTES
    return { start, end: new Date(start.getTime() + dur * 60 * 1000) }
  })

  // Pré-agrupa availabilities por dia local (chave yyyy-MM-dd)
  const avByDay: Record<string, Interval[]> = {}
  for (const av of availabilities) {
    // recorta availability ao próprio dia local em que cada slot cairá; faremos isso por dia abaixo
    // aqui só acumulamos "como veio"
    const key = formatInTimeZone(av.startTime, TZ, "yyyy-MM-dd") // aproximação de agrupamento
    ;(avByDay[key] ||= []).push({ start: av.startTime, end: av.endTime })
  }

  // Monta resultado baseline
  const result: WeeklySchedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }

  // Processa dia a dia
  for (let offset = 0; offset < 7; offset++) {
    const dayLocal = addDays(mondayLocal, offset)
    const dayKey = toDayKey(dayLocal)
    const baseline = buildBaselineSlotsLocal(dayLocal) // slots locais 09..17 -> UTC

    // Recorta appointments da semana que atingem esse dia
    const { start: dayUtcStart, end: dayUtcEnd } = dayRangeUtc(dayLocal)
    const apptsOfDay = apptIntervals.filter((iv) => iv.end > dayUtcStart && iv.start < dayUtcEnd)

    // Availabilities que encostam no dia
    const avOfDayRaw = Object.values(avByDay)
      .flat()
      .filter((iv) => iv.end > dayUtcStart && iv.start < dayUtcEnd)

    // Recorta availability para o dia (clampa nos limites do dia)
    const avOfDay: Interval[] = avOfDayRaw.map((iv) => ({
      start: new Date(Math.max(iv.start.getTime(), dayUtcStart.getTime())),
      end: new Date(Math.min(iv.end.getTime(), dayUtcEnd.getTime())),
    }))

    // Calcula "livres" = availability - appointments
    const freeIntervals: Interval[] = avOfDay.flatMap((av) => subtractIntervals(av, apptsOfDay))
    // Mapeia baseline → available true/false
    const daySlots: DaySlots = baseline.map((slot) => {
      // Slot no passado nunca é true
      const isFuture = slot.startUtc.getTime() >= now.getTime()
      const available = isFuture && slotContainedInFree({ start: slot.startUtc, end: slot.endUtc }, freeIntervals)
      return { time: slot.time, available }
    })

    result[dayKey] = daySlots
  }

  return result
}
