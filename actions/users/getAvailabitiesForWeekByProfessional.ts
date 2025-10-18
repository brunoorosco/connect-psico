"use server"
import { prisma } from "@/lib/db"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"
import { addDays } from "date-fns"

const TZ = "America/Sao_Paulo"
const SLOT_MINUTES = 60
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

/**
 * ✨ NOVA VERSÃO: Constrói slots baseado nos intervalos livres REAIS
 * Não usa mais limites fixos WORK_START/WORK_END
 * 
 * @param ensureMinimumRange - Se true, garante que pelo menos 08:00-18:00 sejam mostrados
 */
function buildDynamicSlotsFromFreeIntervals(
  dayLocal: Date, 
  freeIntervals: Interval[],
  ensureMinimumRange = false
) {
  const slots: { time: string; startUtc: Date; endUtc: Date }[] = []
  const processedHours = new Set<string>()

  if (freeIntervals.length === 0) {
    // Se não há intervalos livres mas queremos range mínimo, cria slots vazios
    if (ensureMinimumRange) {
      const ymd = formatInTimeZone(dayLocal, TZ, "yyyy-MM-dd")
      for (let h = 8; h < 19; h++) {
        const timeLocal = `${ymd}T${String(h).padStart(2, "0")}:00:00`
        const startUtc = fromZonedTime(new Date(timeLocal), TZ)
        const endUtc = new Date(startUtc.getTime() + SLOT_MINUTES * 60 * 1000)
        
        slots.push({
          time: `${String(h).padStart(2, "0")}:00`,
          startUtc,
          endUtc,
        })
      }
    }
    return slots
  }

  // Para cada intervalo livre, gera slots de 60min
  for (const interval of freeIntervals) {
    let current = new Date(interval.start)
    const end = interval.end

    // Arredonda para a hora cheia (floor)
    current.setUTCMinutes(0, 0, 0)

    // Gera slots dentro deste intervalo
    while (current < end) {
      const nextSlot = new Date(current.getTime() + SLOT_MINUTES * 60 * 1000)
      
      // Verifica se o slot inteiro cabe dentro do intervalo livre
      if (nextSlot <= end) {
        // ✅ CORRIGIDO: Formata a hora no timezone de São Paulo
        const hourLocal = formatInTimeZone(current, TZ, "HH:mm")
        
        // Evita duplicatas
        const uniqueKey = `${current.toISOString()}`
        if (!processedHours.has(uniqueKey)) {
          processedHours.add(uniqueKey)
          
          slots.push({
            time: hourLocal, // ✅ Agora em horário local (SP)
            startUtc: new Date(current),
            endUtc: new Date(nextSlot),
          })
        }
      }
      
      current = nextSlot
    }
  }

  // Ordena por horário UTC
  return slots.sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime())
}

/** Subtrai intervalsB (appointments) de intervalA (availability) e retorna "buracos" livres */
function subtractIntervals(intervalA: Interval, intervalsB: Interval[]): Interval[] {
  const B = [...intervalsB].sort((x, y) => x.start.getTime() - y.start.getTime())
  let parts: Interval[] = [intervalA]

  for (const b of B) {
    const nextParts: Interval[] = []
    for (const a of parts) {
      const aS = a.start.getTime(),
        aE = a.end.getTime()
      const bS = b.start.getTime(),
        bE = b.end.getTime()

      if (bE <= aS || bS >= aE) {
        nextParts.push(a)
        continue
      }

      if (bS > aS) nextParts.push({ start: a.start, end: new Date(bS) })
      if (bE < aE) nextParts.push({ start: new Date(bE), end: a.end })
    }
    parts = nextParts
    if (!parts.length) break
  }

  return parts.filter((p) => p.end.getTime() > p.start.getTime())
}

/** Testa se [slotStart, slotEnd] está contido em algum intervalo livre */
function slotContainedInFree(slot: { start: Date; end: Date }, free: { start: Date; end: Date }[]) {
  return free.some((iv) => iv.start.getTime() <= slot.start.getTime() && slot.end.getTime() <= iv.end.getTime())
}

/** Mapeia 0..6 (Date.getDay) para keys em inglês começando segunda */
function toDayKey(d: Date): DayKey {
  const day = d.getDay()
  switch (day) {
    case 1: return "monday"
    case 2: return "tuesday"
    case 3: return "wednesday"
    case 4: return "thursday"
    case 5: return "friday"
    case 6: return "saturday"
    case 0: return "sunday"
    default: return "monday"
  }
}

function floorToHourUtc(d: Date) {
  const x = new Date(d)
  x.setUTCMinutes(0, 0, 0)
  return x
}

function ceilToHourUtc(d: Date) {
  const x = new Date(d)
  if (x.getUTCMinutes() || x.getUTCSeconds() || x.getUTCMilliseconds()) {
    x.setUTCHours(x.getUTCHours() + 1, 0, 0, 0)
  } else {
    x.setUTCMinutes(0, 0, 0)
  }
  return x
}

function mergeIntervals(intervals: { start: Date; end: Date }[]) {
  if (!intervals.length) return []
  const ord = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out = [ord[0]]
  for (let i = 1; i < ord.length; i++) {
    const last = out[out.length - 1]
    const cur = ord[i]
    if (cur.start.getTime() <= last.end.getTime()) {
      if (cur.end.getTime() > last.end.getTime()) last.end = cur.end
    } else out.push(cur)
  }
  return out
}

/**
 * ✨ VERSÃO MELHORADA: Grade semanal 100% dinâmica
 * - Mostra TODOS os horários disponíveis (08:00, 22:00, 23:00, etc.)
 * - Não limita mais a WORK_START/WORK_END
 * - Slots são gerados baseados nos intervalos livres reais
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
  const { start: weekStartUtc } = dayRangeUtc(mondayLocal)
  const { end: weekEndUtc } = dayRangeUtc(addDays(mondayLocal, 6))

  // Busca toda a semana de uma vez
  const [availabilities, appointments] = await Promise.all([
    prisma.availability.findMany({
      where: {
        professionalId: professional.userId,
        isAvailable: true,
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
          { status: "PENDING" },
        ],
      },
      select: { appointmentDate: true },
    }),
  ])

  // Converte appointments em intervals
  const apptIntervals: Interval[] = appointments.map((a) => ({
    start: a.appointmentDate,
    end: new Date(a.appointmentDate.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000),
  }))

  // Pré-agrupa availabilities por dia local
  const avByDay: Record<string, Interval[]> = {}
  for (const av of availabilities) {
    const key = formatInTimeZone(av.startTime, TZ, "yyyy-MM-dd")
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

    const { start: dayUtcStart, end: dayUtcEnd } = dayRangeUtc(dayLocal)
    const apptsOfDay = apptIntervals.filter((iv) => iv.end > dayUtcStart && iv.start < dayUtcEnd)
    const avOfDayRaw = Object.values(avByDay)
      .flat()
      .filter((iv) => iv.end > dayUtcStart && iv.start < dayUtcEnd)

    // Recorta availability para o dia
    const avOfDay: Interval[] = mergeIntervals(
      avOfDayRaw
        .map((iv) => {
          const clampStart = new Date(Math.max(iv.start.getTime(), dayUtcStart.getTime()))
          const clampEnd = new Date(Math.min(iv.end.getTime(), dayUtcEnd.getTime()))
          if (clampEnd <= clampStart) return null

          const roundedStart = floorToHourUtc(clampStart)
          const roundedEnd = ceilToHourUtc(clampEnd)

          const start = new Date(Math.max(roundedStart.getTime(), dayUtcStart.getTime()))
          const end = new Date(Math.min(roundedEnd.getTime(), dayUtcEnd.getTime()))

          return end > start ? { start, end } : null
        })
        .filter((x): x is Interval => !!x)
    )

    // Calcula intervalos livres
    const freeIntervals: Interval[] = avOfDay.flatMap((av) => subtractIntervals(av, apptsOfDay))

    // ✨ USA A NOVA FUNÇÃO DINÂMICA
    const baseline = buildDynamicSlotsFromFreeIntervals(dayLocal, freeIntervals)

    // Mapeia baseline → available true/false
    const daySlots: DaySlots = baseline.map((slot) => {
      const isFuture = slot.startUtc.getTime() >= now.getTime()
      const available =
        isFuture &&
        freeIntervals.length > 0 &&
        slotContainedInFree({ start: slot.startUtc, end: slot.endUtc }, freeIntervals)
      return { time: slot.time, available }
    })

    result[dayKey] = daySlots
  }

  return result
}