import React from "react"
import { WeekDate, Appointment } from "../types"
import { WeekHeader } from "./WeekHeader"
import { TimeColumn } from "./TimeColumn"
import { DayColumn } from "./DayColumn"

interface WeekViewProps {
  weekDates: WeekDate[]
  timeSlots: string[]
  isWorkingHour: (time: string) => boolean
  getAppointmentForSlot: (day: number, time: string) => Appointment | undefined
  onSlotClick: (day: number, time: string, appointment: Appointment | null) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  timeSlots,
  isWorkingHour,
  getAppointmentForSlot,
  onSlotClick,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-white">
      <WeekHeader weekDates={weekDates} />
      
      <div className="grid grid-cols-[50px,repeat(7,1fr)]">
        <TimeColumn timeSlots={timeSlots} />
        {weekDates.map((date, i) => (
          <DayColumn
            key={i}
            date={date}
            timeSlots={timeSlots}
            isWorkingHour={isWorkingHour}
            getAppointmentForSlot={getAppointmentForSlot}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>
    </div>
  )
}
