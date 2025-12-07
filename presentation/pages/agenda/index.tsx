"use client"

import React, { useState } from "react"

import { ProgressWidget } from "@components/Schedule/ProgressWidget"
import { AppointmentModal } from "@components/Schedule/AppointmentModal"
import { AppointmentDrawer } from "@components/Schedule/AppointmentDrawer"
import { FloatingActions } from "@components/Schedule/FloatingActions"
import { useCalendarNavigation } from "@components/Schedule/useCalendarNavigation"
import { useAppointments } from "@components/Schedule/useAppointments"
import { useTimeSlots } from "@components/Schedule/useTimeSlots"
import { Sidebar } from "@components/Schedule/Sidebar"
import { Header } from "@components/Schedule/Header"
import { WeekView } from "@components/Schedule/WeekView"

const CalendarScheduler: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("Cancelado")

  const {
    currentDate,
    selectedDate,
    setSelectedDate,
    previousMonth,
    nextMonth,
    days,
    weekDates,
  } = useCalendarNavigation(new Date(2025, 10, 27))

  const {
    isModalOpen,
    isDrawerOpen,
    selectedSlot,
    selectedAppointment,
    handleSlotClick,
    getAppointmentForSlot,
    closeModal,
    closeDrawer,
  } = useAppointments()

  const { timeSlots, isWorkingHour } = useTimeSlots({
    workingHourStart: 8,
    workingHourEnd: 18,
  })

  const handleClearFilters = () => {
    setStatusFilter("")
  }

  const handleCreateAppointment = () => {
    // Lógica para criar agendamento
    closeModal()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentDate={currentDate}
        selectedDate={selectedDate}
        days={days}
        statusFilter={statusFilter}
        onPreviousMonth={previousMonth}
        onNextMonth={nextMonth}
        onSelectDate={setSelectedDate}
        onClearFilters={handleClearFilters}
        onStatusChange={setStatusFilter}
      />

      <div className="flex-1 flex flex-col">
        <Header
          dateRange="23 – 29 de nov. de 2025"
          onToday={() => setSelectedDate(new Date().getDate())}
          onPreviousWeek={() => {}}
          onNextWeek={() => {}}
        />

        <WeekView
          weekDates={weekDates}
          timeSlots={timeSlots}
          isWorkingHour={isWorkingHour}
          getAppointmentForSlot={getAppointmentForSlot}
          onSlotClick={handleSlotClick}
        />
      </div>

      <FloatingActions onNewAppointment={() => {}} />
      <ProgressWidget progress={0} />

      <AppointmentModal
        isOpen={isModalOpen}
        selectedSlot={selectedSlot}
        onClose={closeModal}
        onSubmit={handleCreateAppointment}
      />

      <AppointmentDrawer
        isOpen={isDrawerOpen}
        appointment={selectedAppointment}
        onClose={closeDrawer}
      />
    </div>
  )
}

export default CalendarScheduler
