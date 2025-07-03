// services/availabilityService.ts
import { format, getDay } from "date-fns";
import { WeeklySchedule, DayAvailability } from "@presentation/pages/availability";

export function getAvailabilityForDate(
  date: Date,
  currentMonth: Date,
  weeklySchedules: WeeklySchedule[],
  dayAvailabilities: DayAvailability[]
) {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayAvailability = dayAvailabilities.find((d) => d.date === dateStr);
  if (dayAvailability) return dayAvailability.timeSlots;

  const isSameMonth =
    date.getMonth() === currentMonth.getMonth() &&
    date.getFullYear() === currentMonth.getFullYear();

  if (!isSameMonth) return [];

  const dayOfWeek = getDay(date);
  const weeklySchedule = weeklySchedules.find((w) => w.dayOfWeek === dayOfWeek);
  return weeklySchedule?.timeSlots || [];
}
