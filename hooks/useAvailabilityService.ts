// hooks/useAvailabilityLogic.ts
import { useState } from "react";
import { WeeklySchedule, DayAvailability } from "@presentation/pages/availability";
import { getAvailabilityForDate as getAvailability } from "@/services/availabilityService";

export function useAvailabilityLogic(
  selectedDate: Date,
  weeklySchedules: WeeklySchedule[],
  dayAvailabilities: DayAvailability[]
) {
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  const getAvailabilityForDate = (date: Date) =>
    getAvailability(date, currentMonth, weeklySchedules, dayAvailabilities);

  return {
    editingDate,
    setEditingDate,
    currentMonth,
    setCurrentMonth,
    getAvailabilityForDate,
  };
}
