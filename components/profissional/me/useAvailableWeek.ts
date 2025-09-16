import { useEffect, useMemo, useState } from "react"
import { fetchProfessionalAvailabilityWeek } from "@/hooks/useProfissionals"
import useSWR from "swr"
import { WeeklySchedule } from "./types"

export function useAvailableWeek(professionalId: number, selectedDate: Date) {
  const [availableSlots, setAvailableSlots] = useState<WeeklySchedule | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    professionalId && selectedDate ? ["/professional-slot-week", professionalId, selectedDate] : null,
    () => fetchProfessionalAvailabilityWeek(professionalId, selectedDate),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (!data) {
      setAvailableSlots(null)
      return
    }
    setAvailableSlots(data)
  }, [data])

  const availableDatesSet = useMemo(() => {
    const unique = new Set<string>()

    if (availableSlots) {
      for (const [day, slots] of Object.entries(availableSlots)) {
        for (const slot of slots) {
          if (slot.available) {
            // aqui você pode escolher salvar só o dia ("monday") ou a data formatada
            unique.add(day)
          }
        }
      }
    }

    return unique
  }, [availableSlots])

  return {
    availableSlots,
    availableDatesSet,
    isLoading,
    error,
    mutate,
  }
}
