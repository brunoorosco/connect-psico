import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { TimeSlot } from "@presentation/pages/availability";

interface TimeSlotFormProps {
  onAddTimeSlot: (timeSlot: Omit<TimeSlot, "id">) => void;
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({ onAddTimeSlot }) => {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      alert("Preencha ambos os horários.");
      return;
    }

    if (startTime >= endTime) {
      alert("O horário inicial deve ser anterior ao horário final.");
      return;
    }

    const newSlot = { startTime, endTime };
    onAddTimeSlot(newSlot);

    // Resetar formulário
    setStartTime("");
    setEndTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time-modal">Horário inicial</Label>
          <Input
            id="start-time-modal"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end-time-modal">Horário final</Label>
          <Input
            id="end-time-modal"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Horário
      </Button>
    </form>
  );
};

export default TimeSlotForm;
