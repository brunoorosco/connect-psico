import { DayAvailability, WeeklySchedule } from "@presentation/pages/availability";
export interface IDayScheduleModal {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  dayAvailabilities: DayAvailability[];
  weeklySchedules: WeeklySchedule[];
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void;
}