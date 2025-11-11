"use client"
import React, { useState } from "react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarCheck, CalendarX } from "lucide-react"
import { useSession } from "next-auth/react"
import { getAppointmentStatusLabel } from "@/utils/getAppointmentStatus"
import { AppointmentModel } from "@/domain/model/appointment"
import { getAppointmentStatusClass } from "@/utils/getAppointmentStatusClass"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { getInitials } from "@/utils/getInitialsName"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@components/ui"

interface AppointmentsListProps {
  appointments: AppointmentModel[]
  selectedDate: Date
  userRole: "SUPERVISOR" | "DEFAULT"
  onViewRecord?: (patientId: string) => void
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, selectedDate, userRole, onViewRecord }) => {
  const isToday = isSameDay(selectedDate, new Date())
  const { data: session } = useSession()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filteredAppointments = appointments?.filter((a) => isSameDay(a.appointmentDate, selectedDate))

  const handleStartConsultation = (patientId: string) => {
    window.location.href = `/app/professional/${session?.user.id}/consulta?patientId=${patientId}`
  }

  const openCancelDialog = (id: number) => {
    setSelectedId(id)
    setIsDialogOpen(true)
  }

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
      <div className="space-y-3 px-2 pb-20">
        {filteredAppointments
          ?.slice()
          .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
          .map((appointment) => (
            <Card
              key={appointment.id}
              className={`rounded-2xl shadow-sm border-l-4 ${
                appointment.status === "COMPLETED"
                  ? "border-l-green-500"
                  : appointment.status === "CANCELLED"
                  ? "border-l-gray-400 opacity-70"
                  : appointment.status === "PENDING"
                  ? "border-l-orange-400"
                  : "border-l-therapy-primary"
              }`}
            >
              <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                {/* Left side */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 sm:size-14">
                    {appointment.patient.image ? (
                      <AvatarImage src={appointment.patient.image} alt={getInitials(appointment.patient.name)} />
                    ) : (
                      <AvatarFallback>{getInitials(appointment.patient.name)}</AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-3">
                      <h3 className="font-medium text-sm sm:text-base">
                        {userRole === "SUPERVISOR" ? appointment.patient.name : "Consulta Psicológica"}
                      </h3>
                      {/* Status tag */}
                      <div
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold text-center sm:mb-0 ${getAppointmentStatusClass(
                          appointment.status as any
                        )}`}
                      >
                        {getAppointmentStatusLabel(appointment.status as any)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-gray-200 rounded-full px-3 py-0.5 text-xs text-therapy-tertiary font-semibold">
                        {appointment.appointmentDate.getHours()}:00
                      </div>

                      {appointment.isNewPatient && (
                        <Badge className="px-2 bg-secondary/80 text-[0.6rem] text-white">Novo Paciente</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 sm:mt-0">
                  {userRole === "SUPERVISOR" && appointment.status !== "CANCELLED" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewRecord && onViewRecord(appointment.patientId)}
                        className="text-therapy-secondary border-primary-foreground shadow-sm"
                      >
                        Ver prontuário
                      </Button>
                      <div className="flex w-full">
                        {appointment.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 w-full"
                            onClick={() => openCancelDialog(appointment.id)}
                          >
                            <CalendarX className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {appointment.status === "CONFIRMED" && isToday && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-therapy-tertiary  w-full text-primary"
                            onClick={() => handleStartConsultation(appointment.patientId)}
                          >
                            <CalendarCheck className="h-4 w-4 mr-1" />
                            Iniciar Sessão
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Modal de cancelamento */}
      <CancelAppointmentDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onConfirmCancel={(id, reason) => handleCancelConsultation(id, reason)}
      />
    </>
  )
}

export default AppointmentsList

// ==========================
// Modal aprimorado (mobile)
// ==========================
const CancelAppointmentDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedId,
  setSelectedId,
  onConfirmCancel,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
  selectedId: number | null
  setSelectedId: (value: number | null) => void
  onConfirmCancel: (id: number, reason: string) => void
}) => {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)

  const MIN_LENGTH = 15
  const isValid = reason.trim().length >= MIN_LENGTH

  const handleConfirm = () => {
    if (!selectedId || !isValid) return
    onConfirmCancel(selectedId, reason.trim())
    resetDialog()
  }

  const handleClose = () => resetDialog()

  const resetDialog = () => {
    setReason("")
    setSelectedId(null)
    setTouched(false)
    setIsDialogOpen(false)
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-sm w-[90%] p-4 rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-center">Confirmar cancelamento</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-gray-600">
            Tem certeza que deseja cancelar esta consulta?
            <br />
            Caso haja devolução, o valor será reembolsado em até <strong>3 dias úteis</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 space-y-1">
          <Textarea
            placeholder="Motivo do cancelamento (mín. 15 caracteres)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            required
            className={`resize-none h-28 text-sm ${
              touched && !isValid ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {touched && !isValid && (
            <span className="text-xs text-red-500">O motivo deve conter ao menos {MIN_LENGTH} caracteres.</span>
          )}
        </div>

        <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleClose} className="w-full bg-gray-100 text-gray-700">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full transition ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Confirmar cancelamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
