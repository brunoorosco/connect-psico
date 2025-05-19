'use client';
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSameDay } from "date-fns";
import { Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "@/domain/model/user";

type Appointment = {
  id: string;
  patientId: string;
  patient: User;
  appointmentDate: Date;
  duration: number;
  status: "scheduled" | "completed" | "canceled";
  notes?: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  selectedDate: Date;
  userRole: "SUPERVISOR" | "DEFAULT";
  onViewRecord?: (patientId: string) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  appointments, 
  selectedDate,
  userRole,
  onViewRecord 
}) => {
  const isToday = isSameDay(selectedDate, new Date());
  const {data:session} = useSession();
console.log(appointments, selectedDate)
  // Filter appointments for the selected date
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${appointment.appointmentDate}`);
    console.log(appointmentDate)
    return isSameDay(appointmentDate, selectedDate);
  });

  const handleStartConsultation = (patientId: string) => {
    window.location.href = `/dashboard/professional/${session?.user.id}/consulta?patientId=${patientId}`;
  };

  if (filteredAppointments?.length === 0) {
    return (
      <Card className="therapy-card">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {isToday 
                ? "Não há consultas agendadas para hoje" 
                : `Não há consultas agendadas para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
              }
            </h3>
            {userRole === "SUPERVISOR" && (
              <p className="text-gray-500">Você pode adicionar novas consultas pelo menu de agendamento</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredAppointments?.map((appointment) => (
        <Card 
          key={appointment.id} 
          className={`therapy-card animate-in-subtle ${
            appointment.status === "completed" 
              ? "border-l-4 border-l-green-400" 
              : appointment.status === "canceled"
              ? "border-l-4 border-l-gray-300 opacity-70"
              : "border-l-4 border-l-therapy-primary"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-therapy-light rounded-full p-2 text-therapy-tertiary">
                  <span className="font-semibold text-sm">{appointment.time || 30}</span>
                </div>
                <div>
                  <h3 className="font-medium">
                    {userRole === "SUPERVISOR" 
                      ? appointment.patient.name 
                      : "Consulta Psicológica"
                    }
                  </h3>
                  <p className="text-sm text-gray-500">{appointment.duration} minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {userRole === "SUPERVISOR" && appointment.status !== "canceled" && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewRecord && onViewRecord(appointment.patientId)}
                      className="text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
                    >
                      Ver prontuário
                    </Button>
                    {appointment.status === "scheduled" && isToday && (
                      <Button 
                        size="sm"
                        className="bg-therapy-primary hover:bg-therapy-tertiary text-white"
                        onClick={() => handleStartConsultation(appointment.patientId)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Iniciar
                      </Button>
                      // <ButtonStartWrapper id={appointment.patientId}/>
                    )}
                  </>
                )}
                <div className={`text-xs px-2 py-1 rounded-full ${
                  appointment.status === "completed" 
                    ? "bg-green-100 text-green-800" 
                    : appointment.status === "canceled"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-therapy-light text-therapy-tertiary"
                }`}>
                  {appointment.status === "scheduled" ? "Agendado" : 
                   appointment.status === "completed" ? "Concluído" : "Cancelado"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;


