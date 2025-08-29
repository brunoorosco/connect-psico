"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Save, Trash2 } from "lucide-react"
import TimeSlotForm from "../TimeSlotForm"
import { useDayScheduleModal } from "@/hooks/useDayScheduleModal"
import { IDayScheduleModal } from "./types"

// ⬇️ ADICIONE
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

  const handleClearAll = () => {
    if (sortedTimeSlots.length === 0) return
    for (const s of sortedTimeSlots) handleRemoveTimeSlot(s.id)
  }

  const titlePrefix = isEditing ? "Editar disponibilidade" : "Nova disponibilidade"
  void weekdayPt[getDay(date)]

  // ⬇️ ADICIONE: helpers de validação
  function dayRangeUtc(dateObj: Date) {
    const ymd = formatInTimeZone(dateObj, TZ, "yyyy-MM-dd")
    const startUtc = fromZonedTime(new Date(`${ymd}T00:00:00.000`), TZ)
    const endUtc   = fromZonedTime(new Date(`${ymd}T23:59:59.999`), TZ)
    return { startUtc, endUtc }
  }

  function slotStartUtc(ymd: string, hhmm: string) {
    return fromZonedTime(new Date(`${ymd}T${hhmm}:00.000`), TZ)
  }

  // ⬇️ ADICIONE: valida “não pode estar no passado”
  function validateNotPast(): { ok: boolean; message?: string } {
    const now = new Date()

    // 1) Se o dia inteiro já passou, bloqueia
    const { endUtc } = dayRangeUtc(date)
    if (endUtc < now) {
      return { ok: false, message: "Não é permitido cadastrar disponibilidade em um dia que já passou." }
    }

    // 2) Se for hoje, bloqueia apenas slots que começam antes de agora
    const ymd = formatInTimeZone(date, TZ, "yyyy-MM-dd")
    const invalid = sortedTimeSlots.filter(s => {
      const start = slotStartUtc(ymd, s.startTime) // "HH:mm"
      return start < now
    })

    if (invalid.length > 0) {
      const list = invalid.map(s => `${s.startTime}–${s.endTime}`).join(", ")
      return { ok: false, message: `Há horários no passado: ${list}. Ajuste os horários antes de salvar.` }
    }

    return { ok: true }
  }

  // >>> Usa a lógica de deletar quando edição + vazio
  const onSave = () => {
    const dateStr = format(date, "yyyy-MM-dd")

    if (isEditing && sortedTimeSlots.length === 0) {
      onDayAvailabilityDelete?.(dateStr)
      onClose()
      return
    }

    // ⬇️ ADICIONE: validação antes de salvar
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
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => { e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {titlePrefix} — {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Horários Configurados</h3>

              {isEditing && sortedTimeSlots.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover todos
                </Button>
              )}
            </div>

            {sortedTimeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>Nenhum horário definido para este dia</p>
                <p className="text-sm mt-1">Adicione um horário abaixo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTimeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <span className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <Button
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

          <div>
            <h3 className="text-lg font-medium mb-4">
              {isEditing ? "Adicionar novo horário" : "Definir horários para este dia"}
            </h3>
            <TimeSlotForm key={date.toISOString()} onAddTimeSlot={handleAddTimeSlot} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {isEditing && (
              <Button
                variant="destructive"
                onClick={() => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  onDayAvailabilityDelete?.(dateStr)
                  onClose()
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir disponibilidade do dia
              </Button>
            )}
            <Button onClick={onSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Salvar Alterações" : "Criar Disponibilidade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DayScheduleModal
