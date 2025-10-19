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
      {error && (
        <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md border border-red-200">
          ⚠️ Falha ao carregar disponibilidade semanal. Tente recarregar a página.
        </div>
      )}

      {orderedEntries.map(([key, slots], idx) => {
        const date = addDaysUTC(weekStartUTC, idx)
        const ymd = formatYMD(date)
        const label = daysOfWeek.find((d) => d.key === key)?.label ?? key

        // Se não tem slots e não está carregando, não mostra o dia
        if (!isLoading && slots.length === 0) {
          return null
        }

        return (
          <div key={key} className="border rounded-lg p-4 transition-all duration-200">
            <h3 className="font-semibold mb-3 text-foreground">
              {label} <span className="text-muted-foreground text-xs">{ymd}</span>
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {/* Skeleton interno apenas se está carregando E não tem slots ainda */}
              {isLoading && slots.length === 0
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={`sk-${i}`} 
                      className="h-9 rounded-md bg-muted animate-pulse"
                      style={{ animationDelay: `${i * 30}ms` }}
                    />
                  ))
                : slots.map((slot, i) => {
                    const isSelected = !!selected && selected.ymd === ymd && selected.time === slot.time
                    const base = slot.available 
                      ? "border-primary text-primary hover:bg-primary/10" 
                      : "opacity-50 cursor-not-allowed"

                    return (
                      <Button
                        key={`${key}-${i}`}
                        variant={slot.available ? (isSelected ? "default" : "outline") : "default"}
                        size="sm"
                        className={`
                          text-xs transition-all duration-200
                          ${base} 
                          ${isSelected ? "bg-primary text-gray-100 ring-2 ring-primary ring-offset-2 hover:bg-primary-foreground" : "hover:bg-gray-100 hover:text-primary-foreground"} 
                          disabled:bg-muted disabled:text-muted-foreground disabled:opacity-40
                        `}
                        disabled={!slot.available}
                        onClick={() => slot.available && onSelect({ ymd, time: slot.time })}
                      >
                        {slot.time}
                      </Button>
                    )
                  })}
            </div>

            {/* Mostra mensagem se não tem horários disponíveis */}
            {!isLoading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sem horários disponíveis neste dia
              </p>
            )}
          </div>
        )
      })}

      {/* Mensagem quando não há nenhum horário na semana */}
      {!isLoading && orderedEntries.every(([_, slots]) => slots.length === 0) && (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-2">📅 Nenhum horário disponível nesta semana</p>
          <p className="text-sm text-muted-foreground">Tente navegar para outra semana</p>
        </div>
      )}
    </div>
  )
}