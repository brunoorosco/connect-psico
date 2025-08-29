// lib/timezone.ts
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"

export const TZ = "America/Sao_Paulo"

// "2025-09-01" + "08:00" (São Paulo) -> Date UTC
export function wallTimeToUtc(dateStr: string, hhmm: string) {
  return fromZonedTime(new Date(`${dateStr}T${hhmm}:00`), TZ)
}

// Date UTC -> "HH:mm" (São Paulo)
export function utcToWallTimeHHmm(dateUtc: Date) {
  return formatInTimeZone(dateUtc, TZ, "HH:mm")
}

// Para consultas por dia: calcula o range UTC equivalente ao dia local
export function dayUtcRangeFor(dateStr: string) {
  const startUtc = fromZonedTime(new Date(`${dateStr}T00:00:00.000`), TZ)
  const endUtc = fromZonedTime(new Date(`${dateStr}T23:59:59.999`), TZ)
  return { startUtc, endUtc }
}
