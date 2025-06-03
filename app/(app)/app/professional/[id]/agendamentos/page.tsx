import { getAppointmentsUsers } from "@/actions/appointments";
import AppointmentCalendar from "@/components/agenda/AppointmentCalender";

const Agenda = async () => {
  const result = await getAppointmentsUsers({ page: 1, limit: 100 });
  if ("error" in result) {
    return <div>Erro ao carregar Agendamentos </div>;
  }
  return result.data && <AppointmentCalendar appointments={result.data} />;
};

export default Agenda;
