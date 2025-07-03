import { WeeklySchedule } from '@presentation/pages/availability';

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
  month: number
): AvailabilityPayload[] {
  const availabilities: AvailabilityPayload[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();

    const schedule = weeklySchedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule) continue;

    const existingIntervals: { start: Date; end: Date }[] = [];

    schedule.timeSlots.forEach(slot => {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);

      const startTime = new Date(year, month, day, startHour, startMinute);
      const endTime = new Date(year, month, day, endHour, endMinute);

      // Validação de sobreposição ou contenção
      const isOverlapping = existingIntervals.some(interval => {
        return (
          (startTime >= interval.start && startTime < interval.end) || // começa dentro de outro
          (endTime > interval.start && endTime <= interval.end) ||     // termina dentro de outro
          (startTime <= interval.start && endTime >= interval.end)     // cobre todo outro intervalo
        );
      });

      if (!isOverlapping) {
        availabilities.push({
          professionalId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: true
        });

        existingIntervals.push({ start: startTime, end: endTime });
      }
    });
  }

  return availabilities;
}
