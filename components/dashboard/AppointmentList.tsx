"use client"
import React, { useState } from "react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { AppointmentModel } from "@/domain/model/appointment"
import { useIsMobile } from "@hooks/use-mobile"
import AppointmentCard from "./AppointmentCard"
import { useCurrentUser } from "@hooks/use-current-user"
interface AppointmentsListProps {
  appointments: AppointmentModel[]
  selectedDate: Date
  userRole: "SUPERVISOR" | "DEFAULT"
  onViewRecord?: (patientId: string) => void
  professionalId: string // Adicione esta prop
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, selectedDate, userRole }) => {
  const isToday = isSameDay(selectedDate, new Date())
  const user = useCurrentUser()
  const mobile = useIsMobile()

  if (!user) return

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filteredAppointments = appointments?.filter((a) => isSameDay(a.appointmentDate, selectedDate))

  const handleCancelConsultation = async (id: number | null, reason: string) => {
    if (!id) return
    console.log("Motivo do cancelamento:", reason)
    setIsDialogOpen(false)
    setSelectedId(null)
  }

  if (filteredAppointments?.length === 0) {
    return (
      <Card className="therapy-card mt-4 mx-2">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {isToday
              ? "Não há consultas agendadas para hoje"
              : `Não há consultas para ${format(selectedDate, "d 'de' MMMM", {
                  locale: ptBR,
                })}`}
          </h3>
          {userRole === "SUPERVISOR" && (
            <p className="text-gray-500 text-sm">Você pode adicionar novas consultas pelo menu de agendamento</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3 pb-20">
        {filteredAppointments
          ?.slice()
          .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
          .map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isMobile={mobile}
              user={user}
              image={appointment?.patient.image ?? ""}
              name={appointment.patient.name}
            />
          ))}
      </div>

      {/* Modal de cancelamento
      <CancelAppointmentDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onConfirmCancel={(id: number, reason: string) => handleCancelConsultation(id, reason)}
      />
      */}
    </>
  )
}

export default AppointmentsList
