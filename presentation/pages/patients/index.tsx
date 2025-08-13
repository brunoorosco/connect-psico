"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import PatientForm from "@/components/patients/PatientForm"
import PatientList from "@/components/patients/PatientList"
import { usePatientManager } from "@/hooks/usePatientManager"
import { useRouter } from "next/navigation"
import { Patient } from "@/types/appointment"
import { usePatientForm } from "@hooks/usePatientForm"

export function PatientsPage() {
  const {
    patients,
    showForm,
    selectedPatient,
    editingPatient,
    handleDeletePatient,
    handleViewPatient,
    handleEditClick,
    handleAppointmentCreate,
    cancelForm,
    setShowForm,
    fetchPatients,
  } = usePatientManager()

  const router = useRouter()

  // Função para redirecionar ao clicar em um paciente
  const handleViewAndRedirect = (patient: Patient) => {
    handleViewPatient(patient)
    router.push(`./pacientes/${patient.userId}`)
  }
  const patientFormHook = usePatientForm({
    patient: selectedPatient,
    mutate: async () => {
      await fetchPatients
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden px-2 py-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* Título e botão responsivos */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-medical text-center sm:text-left">Gerenciamento de Pacientes</h1>
          <div className="flex justify-center sm:justify-end">
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2 shrink-0" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <main>
          {showForm ? (
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xs sm:text-xl">Novo Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientForm
                  patient={editingPatient}
                  onSubmit={patientFormHook.handleSubmit}
                  onCancel={cancelForm}
                  form={patientFormHook.form}
                  handleCepChange={patientFormHook.handleCepChange}
                  isEdit={patientFormHook.isEdit}
                  reset={patientFormHook.reset}
                />
              </CardContent>
            </Card>
          ) : (
            <PatientList
              patients={patients}
              onViewPatient={handleViewAndRedirect} // 🔹 Agora redireciona
              onEditPatient={handleEditClick}
              onDeletePatient={handleDeletePatient}
              onAppointmentCreate={handleAppointmentCreate}
            />
          )}
        </main>
      </div>
    </div>
  )
}
