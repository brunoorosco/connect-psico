import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Appointment, SelectedSlot } from "./types"
import { getAppointmentsUsers, addAppointmentByProfessional, updateAppointmentByProfessional, deleteAppointment } from "@/actions/appointments"
import { getPatientsByProfessionalId } from "@/actions/patients/getPatientsByProfessionalId"
import { AppointmentModel } from "@/domain/model/appointment"

export function useAppointments() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [currentDateFilter, setCurrentDateFilter] = useState<Date>(new Date())

  const fetcher = useCallback(() => getAppointmentsUsers({ page: 1, limit: 100 }), [])
  const patientsFetcher = useCallback(() => getPatientsByProfessionalId(), [])

  const { data, mutate, isLoading } = useSWR("appointments", fetcher)
  const { data: patientsData } = useSWR("patients", patientsFetcher)

  const patients = useMemo(() => {
    if (Array.isArray(patientsData)) return patientsData
    return []
  }, [patientsData])

  // Map real appointments to local type (mimicking the mock structure for compatibility)
  const appointments: Appointment[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((apt: AppointmentModel) => {
      const date = new Date(apt.appointmentDate)

      // Format start time HH:mm
      const startTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      // Calculate end time based on duration (default 60 min if missing)
      const duration = apt.professional?.tempoConsulta || 60
      const endDate = new Date(date.getTime() + duration * 60000)
      const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      return {
        id: apt.id,
        day: date.getDate(),
        startTime,
        endTime,
        patient: apt.patient ? {
          name: apt.patient.name,
          email: "",
          phone: "",
          cpf: "",
          birthDate: "",
          address: ""
        } : { name: "Sem Paciente", email: "", phone: "", cpf: "", birthDate: "", address: "" },
        procedure: "Consulta",
        professional: apt.professional?.name || "",
        room: apt.roomId || "",
        status: apt.status === "CONFIRMED" ? "confirmed" : apt.status === "CANCELLED" ? "cancelled" : "pending",
        color: apt.status === "CONFIRMED" ? "bg-green-500" : "bg-red-500",
        notes: "",
        fullDate: date
      }
    })
  }, [data])

  const handleSlotClick = useCallback((
    day: number,
    time: string,
    appointment: Appointment | null,
    fullDate?: Date // Added fullDate support for creating
  ): void => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setIsDrawerOpen(true)
    } else {
      setSelectedSlot({ day, time, fullDate })
      setIsModalOpen(true)
    }
  }, [])

  const getAppointmentForSlot = useCallback((
    day: number,
    timeSlot: string,
    currentMonthDate?: Date // Helper to match correct month/year
  ): Appointment | undefined => {
    return appointments.find(apt => {
      if (currentMonthDate && apt.fullDate) {
        return apt.fullDate.getDate() === day &&
          apt.fullDate.getMonth() === currentMonthDate.getMonth() &&
          apt.startTime === timeSlot
      }
      return apt.day === day && apt.startTime === timeSlot
    })
  }, [appointments])

  const handleSaveAppointment = async (formData: any) => {
    try {
      if (selectedAppointment) { // Edit
        // Implement update logic later
        toast.info("Edição ainda não implementada")
      } else { // Create
        if (!formData.patientId || !formData.date || !formData.time) {
          toast.warning("Preencha todos os campos obrigatórios")
          return
        }

        // Combine date and time to create appointmentDate
        const [hours, minutes] = formData.time.split(':')
        const appointmentDate = new Date(formData.date)
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        const resp = await addAppointmentByProfessional({
          patientId: formData.patientId,
          startTime: formData.time,
          endTime: "00:00", // Not used for creation validation but required by schema if checked
          appointmentDate: appointmentDate,
          notes: formData.notes
        })

        if (resp?.success) {
          toast.success("Agendamento criado com sucesso!")
          await mutate()
          setIsModalOpen(false)
        } else {
          toast.error(resp?.message || "Erro ao criar agendamento")
        }
      }
    } catch (e) {
      toast.error("Erro ao salvar agendamento")
    }
  }

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return {
    isModalOpen,
    isDrawerOpen,
    selectedSlot,
    selectedAppointment,
    appointments,
    patients, // Expose patients
    isLoading,
    handleSlotClick,
    getAppointmentForSlot,
    handleSaveAppointment, // Expose handler
    closeModal,
    closeDrawer,
    mutate,
  }
}
