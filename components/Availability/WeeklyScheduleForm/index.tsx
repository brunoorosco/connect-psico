"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calendar } from "lucide-react";
import { daysOfWeek, months } from "@/utils/constants";
import { useWeeklySchedule } from "@/hooks/useWeeklySchedule";
import { WeeklyScheduleFormProps } from "./types";


export const WeeklyScheduleForm: React.FC<WeeklyScheduleFormProps> = ({
  weeklySchedules,
  onScheduleUpdate,
}) => {
  const {
    selectedDays,
    startTime,
    endTime,
    selectedMonth,
    handleDayToggle,
    setStartTime,
    setEndTime,
    setSelectedMonth,
    handleSaveAvailability,
    removeTimeSlot,
  } = useWeeklySchedule(weeklySchedules, onScheduleUpdate);

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
            onClick={handleSaveAvailability}
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
