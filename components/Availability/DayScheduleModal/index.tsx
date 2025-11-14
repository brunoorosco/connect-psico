"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format, getDay, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Save, Trash2 } from "lucide-react"
import TimeSlotForm from "../TimeSlotForm"
import { useDayScheduleModal } from "@/hooks/useDayScheduleModal"
import { IDayScheduleModal } from "./types"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"
import { toast } from "sonner"

const TZ = "America/Sao_Paulo"
const weekdayPt = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

export const DayScheduleModal: React.FC<IDayScheduleModal> = ({
  date,
  isOpen,
  onClose,
  dayAvailabilities,
  weeklySchedules,
  onDayAvailabilityUpdate,
  onDayAvailabilityDelete,
}) => {
  const { sortedTimeSlots, handleAddTimeSlot, handleRemoveTimeSlot, hasChanges, handleSave, isEditing } =
    useDayScheduleModal(
      date,
      isOpen,
      dayAvailabilities,
      weeklySchedules,
      onDayAvailabilityUpdate,
      onClose,
      onDayAvailabilityDelete
    )
  const isPastDay = startOfDay(date) < startOfDay(new Date())
  const handleClearAll = () => {
    if (sortedTimeSlots.length === 0) return
    for (const s of sortedTimeSlots) handleRemoveTimeSlot(s.id)
  }

  const titlePrefix = isEditing ? "Editar disponibilidade" : "Nova disponibilidade"
  void weekdayPt[getDay(date)]

  function dayRangeUtc(dateObj: Date) {
    const ymd = formatInTimeZone(dateObj, TZ, "yyyy-MM-dd")
    const startUtc = fromZonedTime(new Date(`${ymd}T00:00:00.000`), TZ)
    const endUtc = fromZonedTime(new Date(`${ymd}T23:59:59.999`), TZ)
    return { startUtc, endUtc }
  }

  function slotStartUtc(ymd: string, hhmm: string) {
    return fromZonedTime(new Date(`${ymd}T${hhmm}:00.000`), TZ)
  }

  function validateNotPast(): { ok: boolean; message?: string } {
    const now = new Date()
    const { endUtc } = dayRangeUtc(date)
    if (endUtc < now) {
      return { ok: false, message: "Não é permitido cadastrar disponibilidade em um dia que já passou." }
    }
    const ymd = formatInTimeZone(date, TZ, "yyyy-MM-dd")
    const invalid = sortedTimeSlots.filter((s) => {
      const start = slotStartUtc(ymd, s.startTime)
      return start < now
    })
    if (invalid.length > 0) {
      const list = invalid.map((s) => `${s.startTime}–${s.endTime}`).join(", ")
      return { ok: false, message: `Há horários no passado: ${list}. Ajuste antes de salvar.` }
    }
    return { ok: true }
  }

  const onSave = () => {
    const dateStr = format(date, "yyyy-MM-dd")
    if (isEditing && sortedTimeSlots.length === 0) {
      onDayAvailabilityDelete?.(dateStr)
      onClose()
      return
    }
    const { ok, message } = validateNotPast()
    if (!ok) {
      toast.error(message)
      return
    }
    handleSave()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[90vw] max-w-lg sm:max-w-2xl 
          max-h-[85vh] overflow-y-auto 
          rounded-2xl p-4 sm:p-6 
        "
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-center sm:text-left">
            {titlePrefix} — {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Lista de horários */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-medium text-center sm:text-left">Horários Configurados</h3>

              {isEditing && sortedTimeSlots.length > 0 && (
                <Button
                  disabled={isPastDay}
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover todos
                </Button>
              )}
            </div>

            {sortedTimeSlots.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>Nenhum horário definido</p>
                <p className="text-sm mt-1">Adicione um horário abaixo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTimeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg border ${
                      isPastDay ? "text-gray-500" : ""
                    } `}
                  >
                    <span className="font-medium text-sm sm:text-base">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <Button
                      disabled={isPastDay}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTimeSlot(slot.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulário */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-center sm:text-left">
              {isEditing ? "Adicionar novo horário" : "Definir horários para este dia"}
            </h3>
            <TimeSlotForm
              key={date.toISOString()}
              onAddTimeSlot={handleAddTimeSlot}
              disabled={isPastDay}
              selectedDate={date}
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>

            {isEditing && (
              <Button
                disabled={isPastDay}
                variant="destructive"
                onClick={() => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  onDayAvailabilityDelete?.(dateStr)
                  onClose()
                }}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Todos
              </Button>
            )}

            <Button onClick={onSave} disabled={!hasChanges} className="w-full sm:w-auto text-white">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DayScheduleModal
