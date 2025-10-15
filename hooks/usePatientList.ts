// hooks/usePatientList.ts
import { PatientModel } from "@/domain/model/patient"
import { useCallback } from "react"

export function usePatientList({
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: {
  onViewPatient: (patient: PatientModel) => void
  onEditPatient: (patient: PatientModel) => void
  onDeletePatient: (patientId: number) => void
}) {
  const handleView = useCallback(
    (patient: PatientModel) => {
      onViewPatient(patient)
    },
    [onViewPatient]
  )

  const handleEdit = useCallback(
    (data: PatientModel) => {
      onEditPatient(data)
    },
    [onEditPatient]
  )

  const handleDelete = useCallback(
    (id: number) => {
      onDeletePatient(id)
    },
    [onDeletePatient]
    
  )

  const handleSendMessage = useCallback((patient: PatientModel) => {
    // Lógica real de envio pode vir de outro hook depois
    console.log("Enviando mensagem para:", patient.name)
  }, [])

  return { handleView, handleEdit, handleDelete, handleSendMessage }
}
