import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Appointment, SelectedSlot } from "./types"
import { getAppointmentsUsers, addAppointmentByProfessional, updateAppointmentByProfessional, deleteAppointment } from "@/actions/appointments"
import { AppointmentModel } from "@/domain/model/appointment"

export function useAppointments() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [currentDateFilter, setCurrentDateFilter] = useState<Date>(new Date())

  const fetcher = useCallback(() => getAppointmentsUsers({ page: 1, limit: 100 }), [])

  const { data, mutate, isLoading } = useSWR("appointments", fetcher)

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
          // Add defaults if missing
          email: "",
          phone: "",
          cpf: "",
          birthDate: "",
          address: ""
        } : { name: "Sem Paciente", email: "", phone: "", cpf: "", birthDate: "", address: "" },
        procedure: "Consulta", // Default or map from somewhere
        professional: apt.professional?.name || "",
        room: apt.roomId || "",
        status: apt.status === "CONFIRMED" ? "confirmed" : apt.status === "CANCELLED" ? "cancelled" : "pending",
        color: apt.status === "CONFIRMED" ? "bg-green-500" : "bg-red-500",
        notes: "",
        fullDate: date // Helper for precise matching
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
      // Adapt to your action's expected payload
      if (selectedAppointment) { // Edit
        // Implement update logic
      } else { // Create
        // formData usually contains patientId, etc.
        // You need to ensure you collect the necessary data in your Modal/Form

        // Example simple integration (adjust as needed based on your Form component)
        /*const resp = await addAppointmentByProfessional({
           patientId: formData.patientId,
           startTime: selectedSlot.time,
           appointmentDate: selectedSlot.fullDate // You need to construct the full ISO string
        })*/
      }
      await mutate()
      setIsModalOpen(false)
      console.log("Saved", formData)
    } catch (e) {
      toast.error("Erro ao salvar")
    }
  }

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return {
    isModalOpen,
    isDrawerOpen,
    selectedSlot,
    selectedAppointment,
    appointments, // Expose mapped appointments
    isLoading,
    handleSlotClick,
    getAppointmentForSlot,
    closeModal,
    closeDrawer,
    mutate,
  }
}
