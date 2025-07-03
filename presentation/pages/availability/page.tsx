"use client";

import React, { useEffect, useState, startTransition } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDayAvailabilitiesForMonth } from "@/actions/availability/getAvailability";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { AvailabilityCalendar,WeeklyScheduleForm } from "@components/Availability";
import { DayAvailability, WeeklySchedule } from "./types";

export const AvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([]);

  const professionalId = useCurrentUser();

  useEffect(() => {
    const toastId = "loading-availability";

    toast.loading("Carregando disponibilidade...", { id: toastId });
    startTransition(() => {
      getDayAvailabilitiesForMonth(professionalId?.id as string, selectedDate)
        .then((data) => {
          setDayAvailabilities(data);
          toast.dismiss(toastId);
        })
        .catch(() => {
          toast.dismiss(toastId);
          toast.error("Erro ao carregar disponibilidade");
        });
    });
  }, [selectedDate]);

  const handleWeeklyScheduleUpdate = (schedules: WeeklySchedule[]) => {
    setWeeklySchedules(schedules);
  };

  const handleDayAvailabilityUpdate = (dayAvailability: DayAvailability) => {
    setDayAvailabilities((prev) => {
      const exists = prev.find((d) => d.date === dayAvailability.date);
      if (!exists) return [...prev, dayAvailability];
      return prev.map((d) => (d.date === dayAvailability.date ? dayAvailability : d));
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
          <div className="lg:col-span-2">
            <AvailabilityCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              weeklySchedules={weeklySchedules}
              dayAvailabilities={dayAvailabilities}
              onDayAvailabilityUpdate={handleDayAvailabilityUpdate}
            />
          </div>

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
