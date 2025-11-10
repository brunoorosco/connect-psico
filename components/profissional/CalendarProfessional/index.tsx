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
import { env } from "@/config/application"
import { PaymentSelector } from "./PaymentSelector"

export const CalendarProfessional = ({ professionalData }: ICalendarProfessional) => {
  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date } | null>(null)
  // estado global de pagamento
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | null>("pix")
  const [errorPayment, setErrorPayment] = useState(false)

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

      const dateStr = formatInTimeZone(day, env.timezone, "yyyy-MM-dd")

      return day < today || !availableDatesSet.has(dateStr)
    },
    [availableDatesSet]
  )
  console.log(paymentMethod)

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
            <>
              <PaymentSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                errorPayment={errorPayment}
                setErrorPayment={setErrorPayment}
              />

              <ScheduleButton
                selectedSlot={selectedSlot}
                userId={session.user.id}
                professional={professionalData}
                onSuccess={mutate}
                errorPayment={errorPayment}
                setErrorPayment={setErrorPayment}
                paymentMethod={paymentMethod}
              />
            </>
          )}
        </div>
      </div>
    </TabsContent>
  )
}
