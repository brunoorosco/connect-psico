import { StatusAppointment } from "@/domain/model/appointment"

export function getAppointmentStatusClass(status: StatusAppointment): string {
  switch (status) {
    case "CONCLUDED":
      return "bg-green-100 text-green-800"
    case "CANCELLED":
    case "PENDING":
      return "bg-gray-100 text-gray-800"
    case "CONFIRMED":
      return "bg-primary text-gray-100"
    case "COMPLETED":
      return "bg-therapy-light text-therapy-tertiary"
  }
}
