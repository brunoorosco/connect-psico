import React from "react"
import { WeekDate, Appointment } from "../types"
import { WeekHeader } from "./WeekHeader"
import { TimeColumn } from "./TimeColumn"
import { DayColumn } from "./DayColumn"
import { CurrentTimeIndicator } from "./CurrentTimeIndicator"

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
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Auto-scroll to today
    const todayColumn = document.getElementById("day-column-today")
    if (todayColumn && containerRef.current) {
      // Simple scroll into view logic
      todayColumn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [weekDates]) // Re-run when dates change (navigating to current week)

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-white">
      <WeekHeader weekDates={weekDates} />

      <div className="grid grid-cols-[50px,repeat(7,minmax(120px,1fr))] relative">
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
        <CurrentTimeIndicator />
      </div>
    </div>
  )
}
