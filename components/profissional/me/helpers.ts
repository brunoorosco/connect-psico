import { WeekKeys } from "./types"

export function addDaysUTC(dateUTC: Date, days: number) {
  const d = new Date(dateUTC)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

export function formatYMD(dateUTC: Date) {
  const y = dateUTC.getUTCFullYear()
  const m = String(dateUTC.getUTCMonth() + 1).padStart(2, "0")
  const d = String(dateUTC.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function composeSlotISO(dateYMD: string, timeHHMM: string) {
  // cria Date UTC a partir de Y-M-D e HH:mm no fuso -03 (America/Sao_Paulo)
  const [hh, mm] = timeHHMM.split(":").map(Number)
  const [y, m, d] = dateYMD.split("-").map(Number)
  // Offset fixo -03:00 (ajuste se usar tz dinamicamente)
  const utcHour = hh + 3 // -03 -> +3 em UTC
  return new Date(Date.UTC(y, m - 1, d, utcHour, mm, 0, 0)).toISOString()
}

export function startOfWeekMonday(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0-6 (Sun=0)
  const diff = (day === 0 ? -6 : 1) - day // move para segunda
  date.setUTCDate(date.getUTCDate() + diff)
  date.setUTCHours(0, 0, 0, 0)
  return date // UTC 00:00 de segunda
}

export const daysOfWeek: { key: WeekKeys; label: string; weekdayIndex: number }[] = [
  { key: "monday", label: "Segunda-feira", weekdayIndex: 1 },
  { key: "tuesday", label: "Terça-feira", weekdayIndex: 2 },
  { key: "wednesday", label: "Quarta-feira", weekdayIndex: 3 },
  { key: "thursday", label: "Quinta-feira", weekdayIndex: 4 },
  { key: "friday", label: "Sexta-feira", weekdayIndex: 5 },
]
