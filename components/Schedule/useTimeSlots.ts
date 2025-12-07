import { useMemo, useCallback } from "react"

interface UseTimeSlotsOptions {
  workingHourStart?: number
  workingHourEnd?: number
}

export function useTimeSlots(options: UseTimeSlotsOptions = {}) {
  const { workingHourStart = 8, workingHourEnd = 18 } = options

  const timeSlots = useMemo((): string[] => {
    const slots: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, "0")}:00`)
      slots.push(`${String(hour).padStart(2, "0")}:30`)
    }
    return slots
  }, [])

  const isWorkingHour = useCallback((timeSlot: string): boolean => {
    const hour = parseInt(timeSlot.split(":")[0])
    return hour >= workingHourStart && hour < workingHourEnd
  }, [workingHourStart, workingHourEnd])

  return { timeSlots, isWorkingHour }
}
