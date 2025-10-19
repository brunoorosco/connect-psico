import { WeeklySchedule } from "@components/profissional/me/types"
// === NOVO: baseline vazio 09:00–18:00 ===
export const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i).padStart(2, "0")}:00`) // 00..23

export const buildEmptyWeek = (): WeeklySchedule => {
  const day = HOURS.map((time) => ({ time, available: false }))
  return {
    monday: [...day],
    tuesday: [...day],
    wednesday: [...day],
    thursday: [...day],
    friday: [...day],
    saturday: [...day],
    sunday: [...day],
  }
}