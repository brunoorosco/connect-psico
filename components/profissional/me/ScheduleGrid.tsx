"use client"

import { Button } from "@components/ui"
import { addDaysUTC, daysOfWeek, formatYMD } from "./helpers"
import { WeeklySchedule } from "./types"
import { useEffect, useMemo, useState } from "react"

type DayKey = keyof WeeklySchedule
type Slot = { time: string; available: boolean }
const ORDER: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export function ScheduleGrid({
  weekStartUTC,
  weekData,
  selected,
  onSelect,
  professionalId,
  onSuccess,
  availableSlots,
  isLoading,
  error,
}: {
  weekStartUTC: Date
  weekData: WeeklySchedule
  selected: { ymd: string; time: string } | null
  onSelect: (payload: { ymd: string; time: string }) => void
  professionalId: number
  onSuccess?: () => void
  availableSlots?: WeeklySchedule
  isLoading?: boolean
  error?: any
}) {
  // mantemos selectedDate local por compatibilidade visual (se quiser pode remover)
  const [selectedDate, setSelectedDate] = useState<Date>(weekStartUTC)
  useEffect(() => setSelectedDate(weekStartUTC), [weekStartUTC])

  // usa os slots vindos do pai, fallback para dados SSR (weekData)
  const week: WeeklySchedule = availableSlots ?? weekData

  const orderedEntries = useMemo(() => {
    const map = new Map(Object.entries(week) as [DayKey, Slot[]][])
    return ORDER.map((k) => [k, map.get(k) ?? []] as [DayKey, Slot[]])
  }, [week])

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-500">Falha ao carregar disponibilidade semanal.</div>}

      {orderedEntries.map(([key, slots], idx) => {
        const date = addDaysUTC(weekStartUTC, idx)
        const ymd = formatYMD(date)
        const label = daysOfWeek.find((d) => d.key === key)?.label ?? key

        return (
          <div key={key} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-foreground">
              {label} <span className="text-muted-foreground text-xs">{ymd}</span>
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
              {isLoading && slots.length === 0
                ? Array.from({ length: 11 }).map((_, i) => (
                    <div key={`sk-${i}`} className="h-8 rounded-md bg-muted animate-pulse" />
                  ))
                : slots.map((slot, i) => {
                    const isSelected = !!selected && selected.ymd === ymd && selected.time === slot.time
                    const base = slot.available ? "border-primary text-primary" : "opacity-50 cursor-not-allowed"

                    return (
                      <Button
                        key={`${key}-${i}`}
                        variant={slot.available ? (isSelected ? "default" : "outline") : "default"}
                        size="sm"
                        className={`text-xs ${base} ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"} disabled:opacity-40`}
                        disabled={!slot.available}
                        onClick={() => onSelect({ ymd, time: slot.time })}
                      >
                        {slot.time}
                      </Button>
                    )
                  })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
