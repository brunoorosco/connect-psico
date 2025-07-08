import { StatusAppointment } from "@/domain/model/appointment";

export function getAppointmentStatusLabel(status: StatusAppointment): string {
  switch (status) {
    case "CONFIRMED":
      return "Agendado";
    case "CONCLUDED":
      return "Concluído";
    case "PENDING":
      return "Aguardando Confirmação";
    case "CANCELLED":
      return "Cancelado";
    default:
      return "Status desconhecido";
  }
}
