"use client";

import React, { startTransition, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calendar } from "lucide-react";
import { WeeklySchedule, TimeSlot } from "@/presentation/pages/availability";
import { generateAvailabilityList } from "@/services/availabilityService";
import { useSession } from "next-auth/react";
import { createAvailabilityBulk } from "@/actions/availability/createManyAvailabity";
import { toast } from "sonner";
import { daysOfWeek, months } from "@/utils/constants";

interface WeeklyScheduleFormProps {
  weeklySchedules: WeeklySchedule[];
  onScheduleUpdate: (schedules: WeeklySchedule[]) => void;
}

const WeeklyScheduleForm: React.FC<WeeklyScheduleFormProps> = ({
  weeklySchedules,
  onScheduleUpdate,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const { data: session } = useSession();

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleApplySchedule = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return;

    const newTimeSlot: TimeSlot = {
      id: `${Date.now()}`,
      startTime,
      endTime,
    };

    const updatedSchedules = [...weeklySchedules];

    selectedDays.forEach((dayOfWeek) => {
      const existingIndex = updatedSchedules.findIndex((s) => s.dayOfWeek === dayOfWeek);
      if (existingIndex >= 0) {
        updatedSchedules[existingIndex].timeSlots.push(newTimeSlot);
      } else {
        updatedSchedules.push({
          dayOfWeek,
          timeSlots: [newTimeSlot],
        });
      }
    });

    onScheduleUpdate(updatedSchedules);

    const availabilities = generateAvailabilityList(
      updatedSchedules,
      session?.user?.id as string,
      new Date().getFullYear(),
      selectedMonth
    );
    console.log(availabilities);
    startTransition(async () => {
      const result = await createAvailabilityBulk(availabilities);
      if (result.error) {
        toast.error("Erro ao criar disponibilidade", { description: result.error });
      } else {
        toast.success("Disponibiliade!", {
          description: "Disponibiliade salva com sucesso!",
        });
        setSelectedDays([]);
        setStartTime("08:00");
        setEndTime("17:00");
      }
    });
  };

  const removeTimeSlot = (dayOfWeek: number, timeSlotId: string) => {
    const updatedSchedules = weeklySchedules
      .map((schedule) => {
        if (schedule.dayOfWeek === dayOfWeek) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.filter((slot) => slot.id !== timeSlotId),
          };
        }
        return schedule;
      })
      .filter((schedule) => schedule.timeSlots.length > 0);

    onScheduleUpdate(updatedSchedules);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Horários Semanais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Selecione os dias da semana:</Label>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="month-select" className="text-sm font-medium mb-2 block">
              Mês de agendamento:
            </Label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Horário inicial</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">Horário final</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleApplySchedule}
            className="w-full"
            disabled={selectedDays.length === 0 || !startTime || !endTime}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aplicar aos Dias Selecionados
          </Button>
        </CardContent>
      </Card>

      {weeklySchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Horários Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const schedule = weeklySchedules.find((s) => s.dayOfWeek === day.value);
                if (!schedule || schedule.timeSlots.length === 0) return null;

                return (
                  <div key={day.value} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{day.label}</h4>
                    <div className="space-y-2">
                      {schedule.timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(day.value, slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyScheduleForm;
