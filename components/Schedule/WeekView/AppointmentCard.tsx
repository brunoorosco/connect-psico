import React from "react"
import { Appointment } from "../types"
import { calculateAppointmentHeight } from "@/utils/appointmentUtils"

interface AppointmentCardProps {
  appointment: Appointment
  onClick: () => void
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick
}) => {
  const height = calculateAppointmentHeight(
    appointment.startTime,
    appointment.endTime
  )

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute inset-x-1 ${appointment.color} text-white rounded p-2 shadow-sm overflow-hidden z-10 hover:shadow-md transition-shadow cursor-pointer`}
      style={{ height: `${height}px` }}
    >
      <div className="text-xs font-semibold truncate">
        {appointment.patient.name}
      </div>
      <div className="text-xs opacity-90 truncate">
        {appointment.procedure}
      </div>
      <div className="text-xs opacity-75 truncate">
        {appointment.professional}
      </div>
      <div className="text-xs opacity-75 mt-1">
        {appointment.startTime} - {appointment.endTime}
      </div>
    </div>
  )
}
