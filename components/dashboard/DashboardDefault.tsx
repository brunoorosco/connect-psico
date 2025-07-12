"use client";
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "./DashboardHeader";
import CalendarNavigation from "./CalendarNavigation";
import AppointmentsList from "./AppointmentList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppointments, useAppointmentsByPatient } from "@/hooks/useAppointments";
import { AppointmentModel } from "@/domain/model/appointment";

// Mock data for the patient dashboard
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
    content:
      "Você tem praticado regularmente as técnicas de respiração e relatou melhora significativa nos momentos de ansiedade.",
  },
  {
    id: 2,
    date: "05/04/2023",
    title: "Reconhecimento de padrões",
    content:
      "Começamos a identificar gatilhos emocionais específicos relacionados ao ambiente de trabalho.",
  },
  {
    id: 3,
    date: "29/03/2023",
    title: "Estabelecimento de metas",
    content:
      "Definimos objetivos claros para as próximas semanas, focando em pequenas mudanças diárias.",
  },
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
  const pastAppointments = appointments?.filter(
    (app: AppointmentModel) => app.appointmentDate < new Date()
  );

  // Filter future appointments
  const futureAppointments = appointments
    ?.map((app: AppointmentModel) => ({
      ...app,
      id: app.id,
    }))
    .filter((app: AppointmentModel) => app.status === "PENDING");

  return (
    <div className="space-y-4 mt-4">
      <DashboardHeader
        title="Meu Acompanhamento"
        subtitle="Histórico e agenda de consultas"
        userRole="DEFAULT"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Consultas</h2>
            {/* <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} /> */}
            {/* <AppointmentsList 
              appointments={futureAppointments}
              selectedDate={selectedDate}
              userRole="DEFAULT"
            /> */}
            {appointments &&
              appointments.map((consulta: any) => (
                <Card key={consulta.id} className="therapy-card border-l-4 border-l-green-400 mb-2">
                  <CardContent className="p-2 pl-4">
                    <div className="flex justify-between items-start text-sm">
                      {/* Lado esquerdo: Nome + Local ou Link */}
                      <div className="flex flex-col">
                        <div className="font-medium">Consulta com: <b>{consulta.professional.name}</b></div>
                        {consulta.tipo === "local" ? (
                          <p className="text-green-600 font-medium">Local: {consulta.endereco}</p>
                        ) : (
                          <a
                            href={consulta.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-medium"
                          >
                            Link para consulta
                          </a>
                        )}
                      </div>

                      {/* Lado direito: Data e Horário */}
                      <div className="text-right font-sm">
                        <div className="">
                          <label className="text-sm text-muted-foreground mr-1">Data:</label>
                          <label className="text-gray-600 font-semibold">
                            {String(consulta.appointmentDate.getUTCDate()).padStart(2, "0")}/
                            {String(consulta.appointmentDate.getUTCMonth() + 1).padStart(2, "0")}/
                            {consulta.appointmentDate.getUTCFullYear()}
                          </label>
                        </div>
                        <div className="">
                          <label className="text-sm text-muted-foreground mr-1">Horário:</label>
                          <label className="text-gray-600 font-semibold">
                            {String(consulta.appointmentDate.getUTCHours()).padStart(2, "0")}h
                            {String(consulta.appointmentDate.getUTCMinutes()).padStart(2, "0")}m
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultas Anteriores</h2>
            <div className="space-y-3">
              {pastAppointments?.map((appointment: AppointmentModel) => (
                <Card key={appointment.id} className="therapy-card border-l-4 border-l-slate-400">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">
                          Consulta com {appointment.professional.name || "Nome do Médico"}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <label className="">Duração da Consulta</label>
                        <label className="">{appointment.duration}</label>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded">{appointment.notes}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* <div>
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
        </div> */}
      </div>
    </div>
  );
};
export default PatientDashboard;
