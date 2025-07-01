"use client";
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import CalendarNavigation from "./CalendarNavigation";
import AppointmentsList from "./AppointmentList";
import PatientRecord from "./PatientRecord";
import { useAppointments } from "@/hooks/useAppointments";
import { useSession } from "next-auth/react";

const mockPatients = [
  {
    id: "1",
    name: "Maria Silva",
    age: 35,
    gender: "Feminino",
    contactInfo: "maria.silva@email.com | (11) 98765-4321",
    initialConsultation: "10/01/2023",
    diagnosis: "Transtorno de Ansiedade Generalizada",
    notes: [
      "Paciente relatou melhora nos episódios de ansiedade após início da meditação diária.",
      "Continuar com as técnicas de respiração e mindfulness ensinadas na última sessão.",
    ],
  },
  {
    id: "2",
    name: "João Oliveira",
    age: 42,
    gender: "Masculino",
    contactInfo: "joao.oliveira@email.com | (11) 91234-5678",
    initialConsultation: "15/02/2023",
    diagnosis: "Depressão Leve",
    notes: [
      "Paciente está respondendo bem ao tratamento combinado.",
      "Incentivado a manter rotina de exercícios físicos e exposição solar matinal.",
    ],
  },
  {
    id: "3",
    name: "Ana Santos",
    age: 28,
    gender: "Feminino",
    contactInfo: "ana.santos@email.com | (11) 95678-1234",
    initialConsultation: "03/03/2023",
    notes: [
      "Primeira sessão focou em estabelecer rapport e entender principais queixas.",
      "Paciente demonstrou abertura ao processo terapêutico.",
    ],
  },
];

const PsychologistDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { appointments, total, loading, fetchAppointments } = useAppointments();
  const { data: session } = useSession();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleViewRecord = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const handleStartConsultation = (patientId: string) => {
    router.push(`/consulta?patientId=${patientId}`);
  };

  const currentPatient = selectedPatient
    ? mockPatients.find((p) => p.id === selectedPatient)
    : mockPatients[0];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Seu Dashboard"
        subtitle="Gerencie suas consultas e pacientes"
        userRole="SUPERVISOR"
      />

      <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Agenda do Dia</h2>
            {/* {selectedPatient && (
              <Button
                onClick={() => handleStartConsultation(selectedPatient)}
                className="bg-therapy-primary hover:bg-therapy-tertiary text-white"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Iniciar Consulta
              </Button>
            )} */}
          </div>
          <AppointmentsList
            appointments={appointments}
            selectedDate={selectedDate}
            userRole="SUPERVISOR"
            onViewRecord={handleViewRecord}
          />
        </div>

        <div className="lg:col-span-6  col-span-12 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Prontuário</h2>
            {/* {currentPatient && <PatientRecord patient={currentPatient} />} */}
          </div>
        </div>
        {/* <div className="lg:col-span-3 col-span-12 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Mensagens
            </h2>
            <MessagesList messages={mockMessages} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default PsychologistDashboard;
