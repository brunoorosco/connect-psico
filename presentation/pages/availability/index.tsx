"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import AvailabilityCalendar from "@/components/Availability/AvailabilityCalendar";
import WeeklyScheduleForm from "@/components/Availability/WeeklyScheduleForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface WeeklySchedule {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

const AvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([]);

  const handleWeeklyScheduleUpdate = (schedules: WeeklySchedule[]) => {
    setWeeklySchedules(schedules);
  };

  const handleDayAvailabilityUpdate = (dayAvailability: DayAvailability) => {
    console.log('dispobilidade111',dayAvailability);
    setDayAvailabilities((prev) => {
      const filtered = prev.filter((d) => d.date !== dayAvailability.date);
      return [...filtered, dayAvailability];
    });
  };

  return (
    <div className="bg-gray-50 container-full">
      <div className="mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-medical flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Sua Disponibilidade
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>

      <main className="mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário - Coluna Principal */}
          <div className="lg:col-span-2">
            <AvailabilityCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              weeklySchedules={weeklySchedules}
              dayAvailabilities={dayAvailabilities}
              onDayAvailabilityUpdate={handleDayAvailabilityUpdate}
            />
          </div>

          {/* Formulário Lateral */}
          <div className="space-y-6">
            <WeeklyScheduleForm
              weeklySchedules={weeklySchedules}
              onScheduleUpdate={handleWeeklyScheduleUpdate}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvailabilityPage;
