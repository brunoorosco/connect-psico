import { WeeklySchedule } from "@presentation/pages/availability/types"

export interface WeeklyScheduleFormProps {
  weeklySchedules: WeeklySchedule[]
  onScheduleUpdate: (schedules: WeeklySchedule[]) => void
  activeMonth?: Date
}
