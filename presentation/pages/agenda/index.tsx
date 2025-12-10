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
    previousWeek, // New
    nextWeek, // New
    days,
    weekDates,
  } = useCalendarNavigation(new Date()) // Remove hardcoded date

  const {
    isModalOpen,
    isDrawerOpen,
    selectedSlot,
    selectedAppointment,
    handleSlotClick,
    getAppointmentForSlot,
    closeModal,
    closeDrawer,
    appointments // Expose for debugging if needed
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

  // Format date range for header
  const startDate = weekDates[0]?.fullDate
  const endDate = weekDates[6]?.fullDate
  const dateRange = startDate && endDate
    ? `${startDate.getDate()} – ${endDate.getDate()} de ${startDate.toLocaleString('default', { month: 'short' })}. de ${startDate.getFullYear()}`
    : ""

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
          dateRange={dateRange}
          onToday={() => setSelectedDate(new Date().getDate())}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />

        <WeekView
          weekDates={weekDates}
          timeSlots={timeSlots}
          isWorkingHour={isWorkingHour}
          getAppointmentForSlot={(day, time) => getAppointmentForSlot(day, time, currentDate)} // Pass currentDate to match correct month
          onSlotClick={(day, time) => {
            // Find the specific date from weekDates
            const dateObj = weekDates.find(w => w.day === day)?.fullDate
            handleSlotClick(day, time, null, dateObj)
          }}
        />
      </div>

      <FloatingActions onNewAppointment={() => { }} />
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
