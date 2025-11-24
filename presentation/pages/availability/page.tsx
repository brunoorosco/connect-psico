"use client"

import React, { useEffect, useState, startTransition } from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getDayAvailabilitiesForMonth } from "@/actions/availability/getAvailability"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "sonner"
import { AvailabilityCalendar, WeeklyScheduleForm } from "@components/Availability"
import { DayAvailability, WeeklySchedule } from "./types"
import { deleteAvailabilityByDate, updateAvailabilityByDate } from "@/actions/availability"

export const AvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([])
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([])
 const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

  const professionalId = useCurrentUser()
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )

  useEffect(() => {
    startTransition(() => {
      getDayAvailabilitiesForMonth(professionalId?.id as string, selectedDate)
        .then((data) => {
          setDayAvailabilities(data)
          //   toast.dismiss(toastId);
        })
        .catch(() => {
          // toast.dismiss(toastId);
          toast.error("Erro ao carregar disponibilidade")
        })
    })
  }, [selectedDate, selectedMonth])

  const handleWeeklyScheduleUpdate = (schedules: WeeklySchedule[]) => {
    setWeeklySchedules(schedules)
  }

  const handleDayAvailabilityUpdate = (dayAvailability: DayAvailability) => {
    startTransition(() => {
      updateAvailabilityByDate(dayAvailability)
        .then(async (res) => {
          if (res?.error) return toast.error(res.error)
          toast.success(res?.success ?? "Atualizado!")
          return getDayAvailabilitiesForMonth(professionalId?.id as string, selectedDate).then(setDayAvailabilities)
        })
        .catch(() => toast.error("Erro ao atualizar disponibilidade"))
    })

    setDayAvailabilities((prev) => {
      const exists = prev.find((d) => d.date === dayAvailability.date)
      if (!exists) return [...prev, dayAvailability]
      return prev.map((d) => (d.date === dayAvailability.date ? dayAvailability : d))
    })
  }

  const handleDayAvailabilityDelete = (dateStr: string) => {
    startTransition(() => {
      deleteAvailabilityByDate(dateStr)
        .then(async (res) => {
          if (res?.error) return toast.error(res.error)
          toast.success(res?.success ?? "Excluído!")
          return getDayAvailabilitiesForMonth(professionalId?.id as string, selectedDate).then(setDayAvailabilities)
        })
        .catch(() => toast.error("Erro ao excluir disponibilidade"))
    })
  }

  return (
    <div className="bg-gray-50 container-full">
      <div className="mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-medical flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Sua Disponibilidade
            </h1>
          </div>
          <div className="text-gray-600 hidden sm:block">{format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}</div>
        </div>
      </div>

      <main className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="lg:col-span-2">
            <AvailabilityCalendar
              onMonthChange={(month) => setSelectedMonth(month)}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              weeklySchedules={weeklySchedules}
              dayAvailabilities={dayAvailabilities}
              onDayAvailabilityUpdate={handleDayAvailabilityUpdate}
              onDayAvailabilityDelete={handleDayAvailabilityDelete}
            />
          </div>

          <div className="space-y-6">
            <WeeklyScheduleForm
              weeklySchedules={weeklySchedules}
              onScheduleUpdate={handleWeeklyScheduleUpdate}
              activeMonth={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AvailabilityPage
