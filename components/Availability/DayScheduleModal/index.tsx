// src/components/DayScheduleModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Save, Trash2 } from "lucide-react";
import TimeSlotForm from "../TimeSlotForm";
import { useDayScheduleModal } from "@/hooks/useDayScheduleModal";
import { DayAvailability, WeeklySchedule } from "@/presentation/pages/availability";

interface Props {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  dayAvailabilities: DayAvailability[];
  weeklySchedules: WeeklySchedule[];
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void;
}

const DayScheduleModal: React.FC<Props> = ({
  date,
  isOpen,
  onClose,
  dayAvailabilities,
  weeklySchedules,
  onDayAvailabilityUpdate,
}) => {
  const {
    timeSlots,
    sortedTimeSlots,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    handleSave,
  } = useDayScheduleModal(
    date,
    isOpen,
    dayAvailabilities,
    weeklySchedules,
    onDayAvailabilityUpdate,
    onClose
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editar Disponibilidade - {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Horários Configurados</h3>
            {sortedTimeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>Nenhum horário definido para este dia</p>
                <p className="text-sm mt-1">Adicione um horário abaixo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTimeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                  >
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
            <h3 className="text-lg font-medium mb-4">Adicionar Novo Horário</h3>
            <TimeSlotForm key={date.toISOString()} onAddTimeSlot={handleAddTimeSlot} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={timeSlots.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayScheduleModal;
