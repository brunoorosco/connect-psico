import { WeeklySchedule, DayAvailability } from "@presentation/pages/availability"
export interface ICustomCalendarDay {
  date: Date
  selectedDate: Date
  getAvailabilityForDate: (date: Date) => { startTime: string; endTime: string }[]
  onClick: (date: Date) => void
}

export interface IAvailabilityCalendar {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  weeklySchedules: WeeklySchedule[]
  dayAvailabilities: DayAvailability[]
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void
  onDayAvailabilityDelete: (dateISO: string) => void
  onMonthChange?: (month: Date) => void // 👈 nova prop
}
