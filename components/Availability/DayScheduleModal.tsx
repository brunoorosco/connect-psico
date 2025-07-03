import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WeeklySchedule, DayAvailability, TimeSlot } from "@/presentation/pages/availability";
import TimeSlotForm from "./TimeSlotForm";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DayScheduleModalProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  dayAvailabilities: DayAvailability[];
  weeklySchedules: WeeklySchedule[];
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void;
}

const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  date,
  isOpen,
  onClose,
  dayAvailabilities,
  weeklySchedules,
  onDayAvailabilityUpdate,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const dateStr = format(date, "yyyy-MM-dd");
      const existingAvailability = dayAvailabilities.find((d) => d.date === dateStr);

      if (existingAvailability) {
        setTimeSlots(existingAvailability.timeSlots);
        setIsEditing(true);
      } else {
        // Usa a programação semanal como base
        const dayOfWeek = getDay(date);
        const weeklySchedule = weeklySchedules.find((w) => w.dayOfWeek === dayOfWeek);
        setTimeSlots(weeklySchedule?.timeSlots || []);
        setIsEditing(false);
      }
    }
  }, [date, isOpen, dayAvailabilities, weeklySchedules]);

  const handleAddTimeSlot = (newSlot: Omit<TimeSlot, "id">) => {
    console.log("handleAddTimeSlot", newSlot);
    const timeSlot: TimeSlot = {
      ...newSlot,
      id: `${Date.now()}-${Math.random()}`,
    };
    setTimeSlots((prev) => [...prev, timeSlot]);
  };

  const handleRemoveTimeSlot = (slotId: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleUpdateTimeSlot = (slotId: string, updatedSlot: Omit<TimeSlot, "id">) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...updatedSlot, id: slotId } : slot))
    );
  };
  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd");

    const hasConflict = timeSlots.some((slot, index, arr) => {
      const [startHour1, startMinute1] = slot.startTime.split(":").map(Number);
      const [endHour1, endMinute1] = slot.endTime.split(":").map(Number);
      const start1 = startHour1 * 60 + startMinute1;
      const end1 = endHour1 * 60 + endMinute1;

      return arr.some((otherSlot, i) => {
        if (i === index) return false;

        const [startHour2, startMinute2] = otherSlot.startTime.split(":").map(Number);
        const [endHour2, endMinute2] = otherSlot.endTime.split(":").map(Number);
        const start2 = startHour2 * 60 + startMinute2;
        const end2 = endHour2 * 60 + endMinute2;

        return (
          (start1 < end2 && end1 > start2) || // sobreposição parcial
          (start1 >= start2 && end1 <= end2) // está contido
        );
      });
    });

    if (hasConflict) {
      toast.error("Há intervalos sobrepostos ou inválidos. Corrija antes de salvar.");
      return;
    }

    onDayAvailabilityUpdate({
      date: dateStr,
      timeSlots,
    });

    onClose();
  };

  const sortedTimeSlots = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editar Disponibilidade - {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Horários atuais */}
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
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
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

          {/* Formulário para adicionar novo horário */}
          <div>
            <h3 className="text-lg font-medium mb-4">Adicionar Novo Horário</h3>
            <TimeSlotForm key={date.toISOString()} onAddTimeSlot={handleAddTimeSlot} />
          </div>

          {/* Botões de ação */}
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
