import React from "react"
import { Appointment } from "../types"
import { AppointmentCard } from "./AppointmentCard"

interface TimeSlotProps {
  time: string
  isWorking: boolean
  isToday: boolean
  appointment?: Appointment
  onSlotClick: (appointment: Appointment | null) => void
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  isWorking,
  isToday,
  appointment,
  onSlotClick,
}) => {
  return (
    <div
      onClick={() => isWorking && onSlotClick(appointment || null)}
      className={`h-8 border-b border-gray-200 relative
        ${!isWorking ? "bg-hatched" : ""}
        ${isToday && isWorking ? "bg-purple-50/30" : ""} 
        ${isWorking ? "hover:bg-gray-50 cursor-pointer" : ""}
        ${appointment ? "z-20" : "z-0"}
      `}
      style={{
        zIndex: appointment ? 30 : 0,
        position: 'relative'
      }}
    >
      {appointment && (
        <AppointmentCard
          appointment={appointment}
          onClick={() => onSlotClick(appointment)}
        />
      )}
    </div>
  )
}
