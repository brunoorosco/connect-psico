"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"

import { CalendarViewType } from "@/types/appointment"
import { AppointmentModel } from "@/domain/model/appointment"
import { deleteAppointment, getAppointmentsUsers } from "@/actions/appointments"
import { addAppointmentByProfessional, updateAppointmentByProfessional } from "@/actions/appointments"

import CalendarHeader from "./CalendarHeader"
import AppointmentModal from "./AppointmentModal"
import DailyView from "./DailyView"
import WeeklyView from "./WeeklyView"
import MonthlyView from "./MonthlyView"
import AppointmentList from "./AppointmentList"

// 🔁 SWR fetcher
const fetchAppointments = () => getAppointmentsUsers({ page: 1, limit: 100 })

const AppointmentCalendar = () => {
  const { data, error, isLoading, mutate } = useSWR("appointments", fetchAppointments)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarViewType>("daily")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentModel | null>(null)

  if (isLoading) return <div>Carregando agendamentos...</div>
  if (error || !data || "error" in data) return <div>Erro ao carregar agendamentos</div>

  const appointments = data.data ?? []

  const handleSaveAppointment = async (appointment: AppointmentModel) => {
    try {
      if (editingAppointment) {
        const resp = await updateAppointmentByProfessional({
          //@ts-ignore
          appointmentDate: new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`),
          //@ts-ignore
          endTime: appointment.endTime,
          //@ts-ignore
          startTime: appointment.startTime,
          patientId: appointment.patientId,
          id: appointment.id,
        })
        if (!resp?.success) {
          toast.error("Erro ao atualizar consulta", {
            description: resp?.message || "Erro desconhecido",
          })
          return
        }
        toast.success("Consulta atualizada", {
          description: "A consulta foi atualizada com sucesso.",
        })
        await mutate()
      } else {
        const resp = await addAppointmentByProfessional({
          patientId: appointment.patientId,
          //@ts-ignore
          appointmentDate: new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`),
          //@ts-ignore
          endTime: appointment.endTime,
          //@ts-ignore
          startTime: appointment.startTime,
          notes: appointment.notes,
        })

        if (!resp?.success) {
          toast.error("Erro ao registrar consulta", {
            description: resp?.message || "Erro desconhecido",
          })
          return
        }

        toast.success("Consulta agendada", {
          description: "Nova consulta agendada com sucesso.",
        })

        await mutate() // 🔁 Revalida os dados após salvar
      }
    } catch (error: any) {
      toast.error("Erro ao registrar consulta", {
        description: error.message || "Erro desconhecido",
      })
    }

    setIsModalOpen(false)
    setEditingAppointment(null)
  }

  const handleAddAppointment = (date: Date) => {
    setSelectedDate(date)
    setEditingAppointment(null)
    setIsModalOpen(true)
  }

  const handleEditAppointment = (appointment: AppointmentModel) => {
    setEditingAppointment(appointment)
    setSelectedDate(appointment.appointmentDate)
    setIsModalOpen(true)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  async function handleDelete(id: number) {
    await deleteAppointment(id) // <- server action
    mutate() // ou mutate / router.refresh()
  }

  const renderCalendarContent = () => {
    switch (view) {
      case "daily":
        return (
          <DailyView
            selectedDate={selectedDate}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment}
          />
        )
      case "weekly":
        return (
          <WeeklyView
            selectedDate={selectedDate}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment}
            onDateSelect={setSelectedDate}
          />
        )
      case "monthly":
      default:
        return (
          <MonthlyView
            selectedDate={selectedDate}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onDateSelect={handleDateSelect}
          />
        )
    }
  }

  return (
    <div className="container-full mx-auto space-y-6">
      <CalendarHeader currentDate={selectedDate} view={view} onViewChange={setView} onDateChange={setSelectedDate} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">{renderCalendarContent()}</div>

        <div className="md:col-span-1">
          <AppointmentList
            onDeleteAppointment={handleDelete}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            view={view}
          />
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAppointment(null)
        }}
        onSave={handleSaveAppointment}
        selectedDate={selectedDate}
        editingAppointment={editingAppointment}
      />
    </div>
  )
}

export default AppointmentCalendar
