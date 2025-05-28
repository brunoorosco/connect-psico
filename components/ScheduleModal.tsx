import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  psychologistName: string;
}

// Dados mockados para exemplo
const availableSlots = {
  "2024-03-20": ["09:00", "10:00", "14:00", "15:00"],
  "2024-03-21": ["08:00", "11:00", "13:00", "16:00"],
  "2024-03-22": ["09:00", "10:00", "15:00", "16:00"],
};

export function ScheduleModal({ open, onOpenChange, psychologistName }: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const getAvailableTimesForDate = (date: Date): string[] => {
    const dateString = date.toISOString().split("T")[0];
    return availableSlots[dateString as keyof typeof availableSlots] || [];
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Consulta com {psychologistName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
          {selectedDate && (
            <div className="space-y-4">
              <h4 className="font-medium">Horários Disponíveis</h4>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableTimesForDate(selectedDate).map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock className="w-4 h-4" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Button
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime}
            className="mt-4"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
