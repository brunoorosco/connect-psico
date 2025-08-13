"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientDetails } from "@/components/patients/PatientDetails"
import { usePatientManager } from "@/hooks/usePatientManager"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import PatientForm from "@components/patients/PatientForm"
import useSWR from "swr"
import { usePatientForm } from "@hooks/usePatientForm"

export function PatientsIdPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const {
    selectedPatient,
    showForm,
    setShowForm,
    backToList,
    editingPatient,
    handleEditClick,
    handleEditPatient,
    fetchPatientById,
    cancelForm,
  } = usePatientManager()
  const { data: patientData, mutate } = useSWR(patientId ? `patients/${patientId}` : null, () =>
    fetchPatientById(patientId!)
  )
  const patientFormHook = usePatientForm({ patient: selectedPatient, mutate })

  useEffect(() => {
    if (patientId) {
      fetchPatientById(patientId)
    }
  }, [patientId])

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-2 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden px-2 py-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-medical text-center sm:text-left">Detalhes do Paciente</h1>
        </div>

        <main>
          {showForm ? (
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xs sm:text-xl">Editar Paciente</CardTitle>
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
            <PatientDetails
              patient={selectedPatient}
              onBack={backToList}
              onEdit={() => handleEditClick(selectedPatient)}
            />
          )}
        </main>
      </div>
    </div>
  )
}
