import { WeeklySchedule, TimeSlot } from '@/pages/availability';

type AvailabilityPayload = {
  professionalId: string;
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
};

export function generateAvailabilityList(
  weeklySchedules: WeeklySchedule[],
  professionalId: string,
  year: number,
  month: number // 0-indexado: Janeiro = 0, Dezembro = 11
): AvailabilityPayload[] {
  const availabilities: AvailabilityPayload[] = [];

  const daysInMonth = new Date(year, month + 1, 0).getDate(); // último dia do mês

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday ... 6 = Saturday

    const schedule = weeklySchedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule) continue;

    schedule.timeSlots.forEach(slot => {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);

      const startTime = new Date(year, month, day, startHour, startMinute);
      const endTime = new Date(year, month, day, endHour, endMinute);

      availabilities.push({
        professionalId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true
      });
    });
  }
  return availabilities;
}
