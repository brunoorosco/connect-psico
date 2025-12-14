import React from "react"
import { WeekDate, Appointment } from "../types"
import { TimeSlot } from "./TimeSlot"

interface DayColumnProps {
  date: WeekDate
  timeSlots: string[]
  isWorkingHour: (time: string) => boolean
  getAppointmentForSlot: (day: number, time: string) => Appointment | undefined
  onSlotClick: (day: number, time: string, appointment: Appointment | null) => void
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  timeSlots,
  isWorkingHour,
  getAppointmentForSlot,
  onSlotClick,
}) => {
  return (
    <div
      className="border-r border-gray-200 relative"
      id={date.isToday ? "day-column-today" : undefined}
    >
      {timeSlots.map((time, j) => {
        const appointment = getAppointmentForSlot(date.day, time)
        const isWorking = isWorkingHour(time)

        return (
          <TimeSlot
            key={j}
            time={time}
            isWorking={isWorking}
            isToday={date.isToday}
            appointment={appointment}
            onSlotClick={(apt) => onSlotClick(date.day, time, apt)}
          />
        )
      })}
    </div>
  )
}
