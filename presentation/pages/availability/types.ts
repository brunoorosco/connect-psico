
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
