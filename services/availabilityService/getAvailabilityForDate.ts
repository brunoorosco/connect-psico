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
  console.log('getAvailabilityForDate.ts:13', dayAvailability);
  if (dayAvailability) return dayAvailability.timeSlots;

  const isSameMonth =
    date.getMonth() === currentMonth.getMonth() &&
    date.getFullYear() === currentMonth.getFullYear();

  if (!isSameMonth) return [];

  const dayOfWeek = getDay(date);
  const weeklySchedule = weeklySchedules.find((w) => w.dayOfWeek === dayOfWeek);
  console.log('getAvailabilityForDate.ts:23', weeklySchedule);
  return weeklySchedule?.timeSlots || [];
}
