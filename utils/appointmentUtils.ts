import { Appointment } from "@components/Schedule/types"

export const calculateAppointmentHeight = (
  startTime: string, 
  endTime: string
): number => {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const durationMinutes = endMinutes - startMinutes
  return (durationMinutes / 30) * 48
}

export const getStatusText = (status: Appointment["status"]): string => {
  const statusMap: Record<Appointment["status"], string> = {
    confirmed: "Confirmado",
    pending: "Pendente",
    cancelled: "Cancelado",
  }
  return statusMap[status] || ""
}

export const getStatusColor = (status: Appointment["status"]): string => {
  const colorMap: Record<Appointment["status"], string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return colorMap[status] || ""
}
