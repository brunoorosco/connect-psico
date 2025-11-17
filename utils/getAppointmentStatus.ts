import { StatusAppointment } from "@/domain/model/appointment";

export function getAppointmentStatusLabel(status: StatusAppointment): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "CONCLUDED":
      return "Concluído";
    case "PENDING":
      return "Aguardando Pagamento";
    case "CANCELLED":
      return "Cancelado";
    default:
      return "Status desconhecido";
  }
}
