"use client";
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "./DashboardHeader";
import CalendarNavigation from "./CalendarNavigation";
import AppointmentsList from "./AppointmentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppointments, useAppointmentsByPatient } from "@/hooks/useAppointments";
import { Appointment } from "@/domain/model/appointment";

// Mock data for the patient dashboard
const mockAppointments = [
  {
    id: '1',
    patientId: '1',
    patientName: "Dr. Roberto Mendes",
    time: "14:00",
    duration: 50,
    status: "scheduled" as const,
  },
  {
    id: '2',
    patientId: '1',
    patientName: "Dr. Roberto Mendes",
    time: "14:00",
    duration: 50,
    status: "completed" as const,
    notes: "Continuação do trabalho com técnicas de mindfulness.",
  },
  {
    id: '3',
    patientId: '1',
    patientName: "Dr. Roberto Mendes",
    time: "14:00",
    duration: 50,
    status: "completed" as const,
    notes: "Discussão sobre estratégias para lidar com situações de estresse no trabalho.",
  },
];

interface ProgressNote {
  id: number;
  date: string;
  title: string;
  content: string;
}

const mockProgressNotes: ProgressNote[] = [
  {
    id: 1,
    date: "12/04/2023",
    title: "Avanço nas técnicas de relaxamento",
    content: "Você tem praticado regularmente as técnicas de respiração e relatou melhora significativa nos momentos de ansiedade."
  },
  {
    id: 2,
    date: "05/04/2023",
    title: "Reconhecimento de padrões",
    content: "Começamos a identificar gatilhos emocionais específicos relacionados ao ambiente de trabalho."
  },
  {
    id: 3,
    date: "29/03/2023",
    title: "Estabelecimento de metas",
    content: "Definimos objetivos claros para as próximas semanas, focando em pequenas mudanças diárias."
  }
];

const PatientDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { appointments, total, loading, fetchAppointments } = useAppointmentsByPatient();
    useEffect(() => {
      fetchAppointments();
    }, []);
  
  // Filter past appointments
  // @ts-ignore
  const pastAppointments = appointments?.filter((app:Appointment) => app.status === "COMPLETED");

  // Filter future appointments
  const futureAppointments = appointments?.map((app:Appointment) => ({
    ...app,
    id: app.id
  })).filter((app:Appointment) => app.status === "PENDING");

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Meu Acompanhamento" 
        subtitle="Histórico e agenda de consultas"
        userRole="DEFAULT"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Consultas</h2>
            {/* <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <AppointmentsList 
              appointments={futureAppointments}
              selectedDate={selectedDate}
              userRole="DEFAULT"
            /> */}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultas Anteriores</h2>
            <div className="space-y-3">
              {pastAppointments?.map((appointment:Appointment) => (
                <Card key={appointment.id} className="therapy-card border-l-4 border-l-green-400">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Consulta com {appointment.professional.name || 'Nome do Médico'}</h3>
                        <p className="text-sm text-gray-500">{appointment.professional.tempoSessao || 'duração'} minutos</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.duration}
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                        {appointment.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seu Progresso</h2>
          <Card className="therapy-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-therapy-tertiary">
                Notas de Evolução
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {mockProgressNotes.map((note, index) => (
                  <div key={note.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="mb-1 flex justify-between">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default PatientDashboard;
