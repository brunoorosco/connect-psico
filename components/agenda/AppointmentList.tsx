import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, isSameDay, isSameWeek, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppointmentModel } from "@/domain/model/appointment"

interface AppointmentListProps {
  appointments: AppointmentModel[]
  selectedDate: Date
  onEditAppointment: (appointment: AppointmentModel) => void
  view: "daily" | "weekly" | "monthly"
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, selectedDate, onEditAppointment, view }) => {
  // Filter appointments based on view and selected date
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      if (view === "daily") {
        return isSameDay(apt.appointmentDate, selectedDate)
      }
      if (view === "weekly") {
        return isSameWeek(apt.appointmentDate, selectedDate, { weekStartsOn: 0 }) // semana começando no domingo
      }
      // Monthly
      return isSameMonth(apt.appointmentDate, selectedDate)
    })
  }, [appointments, selectedDate, view])

  // Sort appointments by date and time
  const sortedAppointments = React.useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      if (a.appointmentDate.getTime() !== b.appointmentDate.getTime()) {
        return a.appointmentDate.getTime() - b.appointmentDate.getTime()
      }
      return a.createdAt && b.createdAt ? a.createdAt.getTime() - b.createdAt.getTime() : 0
    })
  }, [filteredAppointments])

  // Group appointments by date string
  const appointmentsByDate = React.useMemo(() => {
    return sortedAppointments.reduce((acc, apt) => {
      const dateKey = format(apt.appointmentDate, "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(apt)
      return acc
    }, {} as Record<string, AppointmentModel[]>)
  }, [sortedAppointments])

  if (sortedAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            {view === "daily"
              ? "Nenhuma consulta agendada para hoje"
              : view === "weekly"
              ? "Nenhuma consulta agendada para esta semana"
              : "Nenhuma consulta agendada para este mês"}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            {filteredAppointments.length}
            {filteredAppointments.length === 1 ? " consulta agendada" : " consultas agendadas"}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          {Object.entries(appointmentsByDate).map(([date, appointments]) => (
            <div key={date} className="mb-6">
              {view !== "daily" && (
                <h3 className="text-sm sm:text-md font-medium mb-2 text-gray-700 border-b pb-1">
                  {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
              )}
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(appointment.appointmentDate).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{appointment.patient.name}</span>
                        {appointment.notes && <span className="text-xs text-gray-500 mt-1">{appointment.notes}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {appointment.isLinkedToMedicalRecord && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Prontuário vinculado
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => onEditAppointment(appointment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default AppointmentList
