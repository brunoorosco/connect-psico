"use client"

import React, { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { ptBR } from "date-fns/locale"
import { formatInTimeZone } from "date-fns-tz"
import { cn } from "@/lib/utils"
import { env } from "@/config/application"
import { CalendarCheck, X } from "lucide-react"
import { useAvailableSlots } from "@components/profissional/CalendarProfessional/useAvailableSlots"
import { AvailableSlots } from "@components/profissional/CalendarProfessional/AvailableSlots"

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number
  professionalId: string
  currentDate: Date
  onConfirmReschedule: (appointmentId: number, newDate: Date) => Promise<void> | void
}

export const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointmentId,
  professionalId,
  currentDate,
  onConfirmReschedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { availableSlots, availableDatesSet, isLoading, error } = useAvailableSlots(professionalId, selectedDate)

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

  const handleConfirm = async () => {
    if (!selectedSlot) return

    setIsSubmitting(true)
    try {
      await onConfirmReschedule(appointmentId, selectedSlot.start)
      onClose()
      // Reset state
      setSelectedDate(new Date())
      setSelectedSlot(null)
    } catch (error) {
      console.error("Erro ao reagendar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedDate(new Date())
    setSelectedSlot(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Reagendar Consulta
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Calendário */}
          <div>
            <h4 className="text-sm font-medium mb-2">Selecione uma nova data:</h4>
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

          {/* Horários disponíveis */}
          <div>
            <h4 className="text-sm font-medium mb-2">Horários disponíveis:</h4>
            <div className="grid grid-cols-3 gap-2 min-h-[100px]">
              {isLoading ? (
                <p className="text-muted-foreground col-span-3 text-sm">Carregando horários...</p>
              ) : error ? (
                <p className="text-destructive col-span-3 text-sm">Erro ao carregar agenda.</p>
              ) : availableSlots && availableSlots.length > 0 ? (
                <AvailableSlots
                  availableSlots={availableSlots}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                />
              ) : (
                <p className="text-muted-foreground col-span-3 text-sm">Nenhum horário disponível para este dia.</p>
              )}
            </div>

            {/* Botões de ação */}
            {selectedSlot && (
              <div className="mt-6 space-y-2">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Novo horário selecionado:</p>
                  <p className="font-medium">
                    {formatInTimeZone(selectedSlot.start, env.timezone, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1" disabled={isSubmitting}>
                    <CalendarCheck className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Reagendando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
