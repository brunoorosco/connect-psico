"use client"
import React, { useState } from "react"
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
interface Patient {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
}

interface Appointment {
  id: number
  day: number
  startTime: string
  endTime: string
  patient: Patient
  procedure: string
  professional: string
  room: string
  status: "confirmed" | "pending" | "cancelled"
  color: string
  notes: string
}

interface DayObject {
  day: number
  isCurrentMonth: boolean
}

interface WeekDate {
  day: number
  weekDay: string
  isToday: boolean
}

interface SelectedSlot {
  day: number
  time: string
}

const CalendarScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 10, 27)) // 27 de novembro de 2025
  const [selectedDate, setSelectedDate] = useState<number>(27)
  const [statusFilter, setStatusFilter] = useState<string>("Cancelado")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Horário de expediente: 8h às 18h
  const workingHourStart: number = 8
  const workingHourEnd: number = 18

  // Exemplo de agendamentos
  const appointments: Appointment[] = [
    {
      id: 1,
      day: 24,
      startTime: "09:00",
      endTime: "10:00",
      patient: {
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 98765-4321",
        cpf: "123.456.789-00",
        birthDate: "15/03/1985",
        address: "Rua das Flores, 123 - São Paulo, SP",
      },
      procedure: "Consulta Inicial",
      professional: "Dr. Carlos Mendes",
      room: "Sala 1",
      status: "confirmed",
      color: "bg-blue-500",
      notes: "Paciente com histórico de alergias",
    },
    {
      id: 2,
      day: 25,
      startTime: "14:00",
      endTime: "15:30",
      patient: {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(11) 91234-5678",
        cpf: "987.654.321-00",
        birthDate: "22/07/1990",
        address: "Av. Paulista, 1000 - São Paulo, SP",
      },
      procedure: "Retorno",
      professional: "Dra. Ana Paula",
      room: "Sala 2",
      status: "confirmed",
      color: "bg-green-500",
      notes: "Retorno pós-cirurgia",
    },
    {
      id: 3,
      day: 27,
      startTime: "10:00",
      endTime: "11:00",
      patient: {
        name: "Pedro Costa",
        email: "pedro.costa@email.com",
        phone: "(11) 99876-5432",
        cpf: "456.789.123-00",
        birthDate: "10/11/1978",
        address: "Rua dos Pinheiros, 500 - São Paulo, SP",
      },
      procedure: "Avaliação Inicial",
      professional: "Dr. Carlos Mendes",
      room: "Sala 1",
      status: "pending",
      color: "bg-yellow-500",
      notes: "Primeira consulta",
    },
    {
      id: 4,
      day: 27,
      startTime: "15:00",
      endTime: "16:30",
      patient: {
        name: "Ana Paula Oliveira",
        email: "ana.oliveira@email.com",
        phone: "(11) 97654-3210",
        cpf: "321.654.987-00",
        birthDate: "05/05/1995",
        address: "Rua Augusta, 200 - São Paulo, SP",
      },
      procedure: "Tratamento Fisioterapêutico",
      professional: "Dra. Ana Paula",
      room: "Sala 3",
      status: "cancelled",
      color: "bg-red-500",
      notes: "Cancelado pelo paciente - reagendar",
    },
  ]

  const handleSlotClick = (day: number, time: string, appointment: Appointment | null): void => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setIsDrawerOpen(true)
    } else {
      setSelectedSlot({ day, time })
      setIsModalOpen(true)
    }
  }

  const isWorkingHour = (timeSlot: string): boolean => {
    const hour = parseInt(timeSlot.split(":")[0])
    return hour >= workingHourStart && hour < workingHourEnd
  }

  const getAppointmentForSlot = (day: number, timeSlot: string): Appointment | undefined => {
    return appointments.find((apt) => apt.day === day && apt.startTime === timeSlot)
  }

  const calculateAppointmentHeight = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    // Cada slot tem 48px (h-12), então 30 minutos = 48px
    return (durationMinutes / 30) * 48
  }

  const months: string[] = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ]

  const weekDays: string[] = ["D", "S", "T", "Q", "Q", "S", "S"]
  const weekDaysFull: string[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

  const getDaysInMonth = (date: Date): DayObject[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: DayObject[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }

    return days
  }

  const getWeekDates = (): WeekDate[] => {
    const dates: WeekDate[] = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(23) // Começando em 23 de novembro

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push({
        day: date.getDate(),
        weekDay: weekDaysFull[date.getDay()],
        isToday: date.getDate() === 27,
      })
    }
    return dates
  }

  const timeSlots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`)
    timeSlots.push(`${String(hour).padStart(2, "0")}:30`)
  }

  const days: DayObject[] = getDaysInMonth(currentDate)
  const weekDates: WeekDate[] = getWeekDates()

  const previousMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getStatusText = (status: Appointment["status"]): string => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      default:
        return ""
    }
  }

  const getStatusColor = (status: Appointment["status"]): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Calendar and Filters */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        {/* Mini Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">
              {months[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-1">
              <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((dateObj, i) => (
              <button
                key={i}
                onClick={() => dateObj.isCurrentMonth && setSelectedDate(dateObj.day)}
                className={`
                  text-center py-2 text-sm rounded-md
                  ${!dateObj.isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                  ${
                    dateObj.day === selectedDate && dateObj.isCurrentMonth
                      ? "bg-purple-600 text-white font-semibold"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {dateObj.day}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700">Limpar filtros</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md flex items-center justify-between">
                <span className="text-sm text-purple-700">{statusFilter}</span>
                <button className="text-purple-600 hover:text-purple-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profissional</label>
            <Select defaultValue="todos">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
            <Select defaultValue="todos">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Procedimento</label>
            <Select defaultValue="todos">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sala de atendimento</label>
            <Select defaultValue="todas">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button className="w-full text-left text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center justify-between py-2">
            Opções avançadas
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content - Week View */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Hoje
              </button>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-900">23 – 29 de nov. de 2025</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Pedir a Anna
              </Button>
              <Button variant="outline">Semana</Button>
            </div>
          </div>
        </div>

        {/* Week Grid */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="grid grid-cols-[50px,repeat(7,1fr)] border-b border-gray-200">
            <div className="border-r border-gray-200 bg-gray-50 bg-hatched"></div>
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`text-center py-2 border-r border-gray-200 ${date.isToday ? "bg-purple-100" : "bg-gray-50"}`}
              >
                <div className={`text-xs font-medium mb-1 text-gray-500`}>
                  <span
                    className={`text-xl font-medium mb-1 ${
                      date.isToday ? "bg-purple-600 text-white rounded-sm p-1" : "text-gray-500"
                    }`}
                  >
                    {date.day}
                  </span>
                  <span className="ml-1 text-[0.9rem]">{date.weekDay}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[50px,repeat(7,1fr)]">
            <div className="border-r border-gray-200">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-8 border-b border-gray-200 px-2 text-right text-xs text-gray-500 pt-2">
                  {time}
                </div>
              ))}
            </div>
            {weekDates.map((date, i) => (
              <div key={i} className="border-r border-gray-200 relative">
                {timeSlots.map((time, j) => {
                  const appointment = getAppointmentForSlot(date.day, time)
                  const isWorking = isWorkingHour(time)

                  return (
                    <div
                      key={j}
                      onClick={() => isWorking && handleSlotClick(date.day, time, appointment || null)}
                      className={`h-8 border-b border-gray-200 relative
                        ${!isWorking ? "bg-hatched" : ""}
                        ${date.isToday && isWorking ? "bg-purple-50/30" : ""} 
                        ${isWorking ? "hover:bg-gray-50 cursor-pointer" : ""}
                      `}
                    >
                      {appointment && (
                        <div
                          className={`absolute inset-x-1 ${appointment.color} text-white rounded p-2 shadow-sm overflow-hidden z-10 hover:shadow-md transition-shadow`}
                          style={{
                            height: `${calculateAppointmentHeight(appointment.startTime, appointment.endTime)}px`,
                          }}
                        >
                          <div className="text-xs font-semibold truncate">{appointment.patient.name}</div>
                          <div className="text-xs opacity-90 truncate">{appointment.procedure}</div>
                          <div className="text-xs opacity-75 truncate">{appointment.professional}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>

      {/* Progress Widget */}
      <div className="fixed bottom-6 right-24 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold text-gray-900">0%</div>
          <div className="text-sm text-gray-600">Seu progresso</div>
        </div>
      </div>

      {/* Modal - Novo Agendamento */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Novo Agendamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    defaultValue={selectedSlot ? `2025-11-${String(selectedSlot.day).padStart(2, "0")}` : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    defaultValue={selectedSlot?.time || ""}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                    <SelectItem value="pedro">Pedro Costa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profissional</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carlos">Dr. Carlos Mendes</SelectItem>
                    <SelectItem value="ana">Dra. Ana Paula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Procedimento</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o procedimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta Inicial</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="tratamento">Tratamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="60"
                    defaultValue="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sala</label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a sala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sala1">Sala 1</SelectItem>
                      <SelectItem value="sala2">Sala 2</SelectItem>
                      <SelectItem value="sala3">Sala 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações sobre o agendamento..."
                ></textarea>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Criar Agendamento</Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer - Detalhes do Agendamento */}
      {isDrawerOpen && selectedAppointment && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes do Agendamento</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>

              {/* Informações do Agendamento */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Agendamento</h3>

                <div>
                  <label className="text-xs text-gray-500">Data e Horário</label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.day}/11/2025 - {selectedAppointment.startTime} às {selectedAppointment.endTime}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Profissional</label>
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.professional}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Procedimento</label>
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.procedure}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Sala</label>
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.room}</p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <label className="text-xs text-gray-500">Observações</label>
                    <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Divisor */}
              <div className="border-t border-gray-200"></div>

              {/* Informações do Paciente */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Paciente</h3>

                <div>
                  <label className="text-xs text-gray-500">Nome</label>
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.patient.name}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-sm text-gray-700">{selectedAppointment.patient.email}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Telefone</label>
                  <p className="text-sm text-gray-700">{selectedAppointment.patient.phone}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">CPF</label>
                  <p className="text-sm text-gray-700">{selectedAppointment.patient.cpf}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Data de Nascimento</label>
                  <p className="text-sm text-gray-700">{selectedAppointment.patient.birthDate}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Endereço</label>
                  <p className="text-sm text-gray-700">{selectedAppointment.patient.address}</p>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3 pt-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Editar Agendamento</Button>
                <Button variant="outline" className="w-full">
                  Ver Prontuário
                </Button>
                {selectedAppointment.status !== "cancelled" && (
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                    Cancelar Agendamento
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CalendarScheduler
