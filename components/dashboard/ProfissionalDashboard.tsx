"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "./DashboardHeader"
import CalendarNavigation from "./CalendarNavigation"
import AppointmentsList from "./AppointmentList"
import { useAppointments } from "@/hooks/useAppointments"

const PsychologistDashboard: React.FC = () => {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const { appointments, total, loading, fetchAppointments } = useAppointments()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleViewRecord = (patientId: string) => {
    setSelectedPatient(patientId)
  }

  const handleStartConsultation = (patientId: string) => {
    router.push(`/consulta?patientId=${patientId}`)
  }

  return (
    <div className="space-y-6  px-2 py-4 sm:px-6 lg:px-8">
      <DashboardHeader title="Meu Board" subtitle="Gerencie suas consultas e pacientes" userRole="SUPERVISOR" />

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
            {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">Prontuário</h2> */}
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
  )
}

export default PsychologistDashboard
