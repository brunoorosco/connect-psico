"use client";

import { useState, startTransition } from "react";
import { WeeklySchedule } from "@presentation/pages/availability";
import { generateAvailabilityList } from "@/services/availabilityService";
import { createAvailabilityBulk } from "@/actions/availability/createManyAvailabity";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UseWeeklyScheduleParams {
  weeklySchedules: WeeklySchedule[];
  onScheduleUpdate: (schedules: WeeklySchedule[]) => void;
}

export function useWeeklySchedule(
  weeklySchedules: WeeklySchedule[],
  onScheduleUpdate: (schedules: WeeklySchedule[]) => void
) {
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

  const handleSaveAvailability = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return;

    const newTimeSlotsByDay: WeeklySchedule[] = selectedDays.map((dayOfWeek) => ({
      dayOfWeek,
      timeSlots: [
        {
          id: `${Date.now()}-${dayOfWeek}-${Math.random()}`,
          startTime,
          endTime,
        },
      ],
    }));

    const availabilities = generateAvailabilityList(
      newTimeSlotsByDay,
      session?.user?.id as string,
      new Date().getFullYear(),
      selectedMonth
    );

    startTransition(async () => {
      const result = await createAvailabilityBulk(availabilities);

      if (result.error) {
        toast.error("Erro ao criar disponibilidade", { description: result.error });
        return;
      }
      // Atualiza o estado apenas com os novos timeSlots após sucesso
      const updatedSchedules = [...weeklySchedules];

      newTimeSlotsByDay.forEach(({ dayOfWeek, timeSlots }) => {
        const existingIndex = updatedSchedules.findIndex((s) => s.dayOfWeek === dayOfWeek);
        if (existingIndex >= 0) {
          updatedSchedules[existingIndex].timeSlots.push(...timeSlots);
        } else {
          updatedSchedules.push({ dayOfWeek, timeSlots });
        }
      });
      onScheduleUpdate(updatedSchedules);

      toast.success("Disponibilidade!", {
        description: "Disponibilidade salva com sucesso!",
      });

      setSelectedDays([]);
      setStartTime("08:00");
      setEndTime("17:00");
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

  return {
    selectedDays,
    startTime,
    endTime,
    selectedMonth,
    setSelectedMonth,
    setStartTime,
    setEndTime,
    handleDayToggle,
    handleSaveAvailability,
    removeTimeSlot,
  };
}
