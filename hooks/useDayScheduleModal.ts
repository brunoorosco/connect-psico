"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { format, getDay } from "date-fns"
import { toast } from "sonner"
import { DayAvailability, TimeSlot, WeeklySchedule } from "@/presentation/pages/availability/types"

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = toMin(aStart),
    aE = toMin(aEnd)
  const bS = toMin(bStart),
    bE = toMin(bEnd)
  return aS < bE && bS < aE // interseção estrita cobre “dentro”, “partial”, etc.
}
function normalize(slots: TimeSlot[]) {
  // ordena e remove duplicados exatos
  const byStart = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const uniq: TimeSlot[] = []
  for (const s of byStart) {
    if (!uniq.some((u) => u.startTime === s.startTime && u.endTime === s.endTime)) uniq.push(s)
  }
  return uniq
}
function sameSlots(a: TimeSlot[], b: TimeSlot[]) {
  const A = normalize(a),
    B = normalize(b)
  if (A.length !== B.length) return false
  return A.every((s, i) => s.startTime === B[i].startTime && s.endTime === B[i].endTime)
}

export function useDayScheduleModal(
  date: Date,
  isOpen: boolean,
  dayAvailabilities: DayAvailability[],
  weeklySchedules: WeeklySchedule[],
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void,
  onClose: () => void,
  onDayAvailabilityDelete?: (dateISO: string) => void
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // snapshot inicial do conteúdo carregado no modal (serve para detectar alterações)
  const initialSlotsRef = useRef<TimeSlot[] | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const dateStr = format(date, "yyyy-MM-dd")
    const existingAvailability = dayAvailabilities.find((d) => d.date === dateStr)

    if (existingAvailability) {
      const slots = normalize(existingAvailability.timeSlots)
      setTimeSlots(slots)
      setIsEditing(true)
      initialSlotsRef.current = slots
    } else {
      const dayOfWeek = getDay(date)
      const weeklySchedule = weeklySchedules.find((w) => w.dayOfWeek === dayOfWeek)
      const slots = normalize(weeklySchedule?.timeSlots || [])
      setTimeSlots(slots)
      setIsEditing(false)
      initialSlotsRef.current = slots
    }
  }, [date, isOpen, dayAvailabilities, weeklySchedules])

  // ======= NOVO: validação no “adicionar” =======
  const handleAddTimeSlot = (newSlot: Omit<TimeSlot, "id">) => {
    const startOk = typeof newSlot.startTime === "string" && /^\d{2}:\d{2}$/.test(newSlot.startTime)
    const endOk = typeof newSlot.endTime === "string" && /^\d{2}:\d{2}$/.test(newSlot.endTime)
    if (!startOk || !endOk) {
      toast.error("Horário inválido. Use HH:MM.")
      return
    }
    if (toMin(newSlot.startTime) >= toMin(newSlot.endTime)) {
      toast.error("Hora inicial deve ser menor que a final.")
      return
    }
    const conflict = timeSlots.some((s) => overlaps(newSlot.startTime, newSlot.endTime, s.startTime, s.endTime))
    if (conflict) {
      toast.error("O horário informado conflita com um horário já existente.")
      return
    }
    // evita duplicar exatamente o mesmo intervalo
    const duplicate = timeSlots.some((s) => s.startTime === newSlot.startTime && s.endTime === newSlot.endTime)
    if (duplicate) {
      toast.warning("Esse intervalo já foi adicionado.")
      return
    }
    const timeSlot: TimeSlot = { ...newSlot, id: `${Date.now()}-${Math.random()}` }
    setTimeSlots((prev) => normalize([...prev, timeSlot]))
  }

  const handleRemoveTimeSlot = (slotId: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId))
  }

  // ======= AJUSTE: checagem de conflito simplificada no save =======
  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd")
    const sorted = normalize(timeSlots)

    // valida sobreposição (igual ao seu)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      if (overlaps(prev.startTime, prev.endTime, cur.startTime, cur.endTime)) {
        toast.error("Há intervalos sobrepostos. Corrija antes de salvar.")
        return
      }
    }

    if (isEditing && sorted.length === 0) {
      // >>> aqui é DELETE no backend
      console.log('[useDayScheduleModal.ts:119]', { onDayAvailabilityDelete });
      if (onDayAvailabilityDelete) {
        onDayAvailabilityDelete(dateStr)
      } else {
        // fallback: se não passarem o callback, ainda limpa localmente
        onDayAvailabilityUpdate({ date: dateStr, timeSlots: [] })
      }
      onClose()
      return
    }

    // upsert normal
    onDayAvailabilityUpdate({ date: dateStr, timeSlots: sorted })
    onClose()
  }

  const sortedTimeSlots = useMemo(() => normalize(timeSlots), [timeSlots])

  // ======= NOVO: flag para controlar o botão “Salvar” por mudança real =======
  const hasChanges = useMemo(() => {
    const initial = initialSlotsRef.current ?? []
    return !sameSlots(initial, timeSlots)
  }, [timeSlots])

  return {
    timeSlots,
    isEditing,
    sortedTimeSlots,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    handleSave,
    hasChanges,
  }
}
