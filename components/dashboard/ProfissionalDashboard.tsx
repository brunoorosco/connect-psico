"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "./DashboardHeader"
import CalendarNavigation from "./CalendarNavigation"
import AppointmentsList from "./AppointmentList"
import { useAppointments } from "@/hooks/useAppointments"
import { Button } from "@components/ui/button"
import { Calendar } from "lucide-react"
import { useCurrentUser } from "@hooks/use-current-user"
import { PatientRecordsTab } from "@components/patients/PatientDetails/PatientRecordsTab"

const PsychologistDashboard: React.FC = () => {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const { appointments, total, loading, fetchAppointments } = useAppointments()
  const user = useCurrentUser()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleViewRecord = (patientId: string) => {
    setSelectedPatient(patientId)
  }

  const handleStartConsultation = (patientId: string) => {
    router.push(`./app/professional/${user?.id}/pacientes/${patientId}/consulta`)
  }

  // Função para verificar se a data selecionada é hoje ou no futuro
  const isTodayOrFuture = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate >= today
  }

  return (
    <div className="space-y-6 px-2 py-4 sm:px-6 lg:px-8">
      <DashboardHeader title="Meu Board" subtitle="Gerencie suas consultas e pacientes" userRole="SUPERVISOR" />

      <CalendarNavigation
        selectedDate={selectedDate}
        onDateChange={(date) => {
          setSelectedDate(date)
          setSelectedPatient(null)
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Agenda do Dia</h2>
            {selectedPatient && isTodayOrFuture(selectedDate) && (
              <Button
                onClick={() => handleStartConsultation(selectedPatient)}
                className="bg-therapy-primary hover:bg-therapy-tertiary text-white"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Iniciar Consulta
              </Button>
            )}
          </div>
          <AppointmentsList
            appointments={appointments}
            selectedDate={selectedDate}
            userRole="SUPERVISOR"
            onViewRecord={handleViewRecord}
          />
        </div>

        <div className="lg:col-span-6 col-span-12 space-y-6">
          {selectedPatient && <PatientRecordsTab patientId={selectedPatient} />}
        </div>
      </div>
    </div>
  )
}

export default PsychologistDashboard
