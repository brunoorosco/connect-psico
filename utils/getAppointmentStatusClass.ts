import { StatusAppointment } from "@/domain/model/appointment"

export function getAppointmentStatusClass(status: StatusAppointment): string {
  switch (status) {
    case "CONCLUDED":
      return "bg-green-100 text-green-800"
    case "CANCELLED":
      return "bg-gray-100 text-gray-800"
    case "PENDING":
      return "bg-blue-100 text-blue-800"
    case "CONFIRMED":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300"
    case "COMPLETED":
      return "bg-therapy-light text-therapy-tertiary"
    default:
      return "bg-gray-100 text-gray-800" // fallback seguro
  }
}
