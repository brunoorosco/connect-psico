"use client"

import { startTransition, useEffect, useState } from "react"
import { deletePatient, getPatientsByProfessionalId } from "@/actions/patients"
import { toast } from "sonner"
import { getPatientsByIdProfessionalById } from "@/actions/patients/getPatientsByIdProfessionalById"
import { PatientModel } from "@/domain/model/patient"

export function usePatientManager() {
  const [patients, setPatients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [editingPatient, setEditingPatient] = useState<any>(null)

  const fetchPatients = async () => {
    startTransition(async () => {
      try {
        const result = await getPatientsByProfessionalId()
        if (!Array.isArray(result)) {
          toast.error("Erro ao carregar pacientes")
          console.error("Erro no carregamento:", result.error)
          return
        }
        setPatients(result)
      } catch (err) {
        toast.error("Erro inesperado")
        console.error("Erro na requisição:", err)
      }
    })
  }
  const fetchPatientById = async (patientId: string) => {
    try {
      const result = await getPatientsByIdProfessionalById(patientId)
      if ("error" in result) {
        toast.error("Erro ao carregar paciente")
        console.error("Erro no carregamento:", result?.error)
        return
      }
      setSelectedPatient(result[0]) // Agora seta o paciente único
    } catch (err) {
      toast.error("Erro inesperado")
      console.error("Erro na requisição:", err)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleAddPatient = (patient: any) => {
    const newPatient: PatientModel = {
      ...patient,
      id: parseInt(Math.random().toString().substring(2, 9)),
    }
    setPatients((prev) => [...prev, newPatient])
    setShowForm(false)
  }

  const handleEditPatient = (patientData: any) => {
    if (!editingPatient) return
    setPatients((prev) => prev.map((p) => (p.id === editingPatient.id ? { ...editingPatient, ...patientData } : p)))
    setEditingPatient(null)
    setShowForm(false)
  }

  const handleDeletePatient = (id: number) => {
    startTransition(async () => {
      try {
        const result = await deletePatient(id)

        // Se a função deletePatient está correta, deve retornar o paciente atualizado, não um array
        if (!result || result.deletedAt === null) {
          toast.error("Erro ao excluir paciente")
          console.error("Erro no retorno da exclusão:", result)
          return
        }

        // Atualiza a lista removendo o paciente deletado
        setPatients((prev) => prev.filter((p) => p.id !== id))

        toast.success("Paciente excluído com sucesso")
      } catch (err: any) {
        toast.error(err.message || "Erro inesperado ao excluir paciente")
        console.error("Erro na requisição:", err)
      }
    })
  }

  const handleViewPatient = (patient: PatientModel) => {
    console.log("handleViewPatient", patient)
    setSelectedPatient(patient)
  }

  const handleEditClick = (patient: PatientModel) => {
    setEditingPatient(patient)
    setShowForm(true)
  }

  const handleAppointmentCreate = (patient: PatientModel) => {
    console.log("handleAppointmentCreate", patient)
    setSelectedPatient(patient)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingPatient(null)
  }

  const backToList = () => setSelectedPatient(null)

  return {
    patients,
    showForm,
    selectedPatient,
    editingPatient,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
    handleViewPatient,
    handleEditClick,
    cancelForm,
    backToList,
    setShowForm,
    handleAppointmentCreate,
    fetchPatientById,
    fetchPatients,
  }
}
