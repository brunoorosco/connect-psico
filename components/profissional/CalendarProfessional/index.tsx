"use client"

import { Calendar } from "@/components/ui/calendar"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useState, useCallback } from "react"
import { ptBR } from "date-fns/locale"
import { formatInTimeZone } from "date-fns-tz"

import { useAvailableSlots } from "./useAvailableSlots"
import { AvailableSlots } from "./AvailableSlots"
import { ScheduleButton } from "./ScheduleButton"
import { ICalendarProfessional } from "./types"

const TZ = "America/Sao_Paulo"

export const CalendarProfessional = ({ professionalData }: ICalendarProfessional) => {
  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date } | null>(null)

  const { availableSlots, availableDatesSet, isLoading, error, mutate } = useAvailableSlots(
    professionalData.id,
    selectedDate
  )

  const isDayDisabled = useCallback(
    (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const day = new Date(date)
      day.setHours(0, 0, 0, 0)

      const dateStr = formatInTimeZone(day, TZ, "yyyy-MM-dd")

      return day < today || !availableDatesSet.has(dateStr)
    },
    [availableDatesSet]
  )
  
  return (
    <TabsContent value="schedule" className="pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm">Selecione uma data:</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date)
                setSelectedSlot(null)
              }
            }}
            locale={ptBR}
            className={cn("rounded-md border pointer-events-auto max-w-none w-full")}
            disabled={isDayDisabled}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Horários disponíveis:</h4>
          <div className="grid grid-cols-3 gap-2 min-h-[100px]">
            {isLoading ? (
              <p className="text-muted-foreground col-span-3">Carregando horários...</p>
            ) : error ? (
              <p className="text-muted-foreground col-span-3">Erro ao carregar agenda.</p>
            ) : availableSlots && availableSlots.length > 0 ? (
              <AvailableSlots
                availableSlots={availableSlots}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            ) : (
              <p className="text-muted-foreground col-span-3">Nenhum horário disponível para este dia.</p>
            )}
          </div>

          {selectedSlot && status === "authenticated" && session?.user?.id && (
            <ScheduleButton
              selectedSlot={selectedSlot}
              userId={session.user.id}
              professional={professionalData}
              onSuccess={mutate}
            />
          )}
        </div>
      </div>
    </TabsContent>
  )
}
