import { useState, useCallback } from "react"
import { Appointment, SelectedSlot } from "./types"
import { appointments } from "./mock"

export function useAppointments() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleSlotClick = useCallback((
    day: number, 
    time: string, 
    appointment: Appointment | null
  ): void => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setIsDrawerOpen(true)
    } else {
      setSelectedSlot({ day, time })
      setIsModalOpen(true)
    }
  }, [])

  const getAppointmentForSlot = useCallback((
    day: number, 
    timeSlot: string
  ): Appointment | undefined => {
    return appointments.find(apt => apt.day === day && apt.startTime === timeSlot)
  }, [])

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return {
    isModalOpen,
    isDrawerOpen,
    selectedSlot,
    selectedAppointment,
    handleSlotClick,
    getAppointmentForSlot,
    closeModal,
    closeDrawer,
  }
}
