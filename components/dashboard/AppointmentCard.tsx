import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarCheck, LucideCalendarSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/getInitialsName"
import { getAppointmentStatusLabel } from "@/utils/getAppointmentStatus"
import { cn } from "@/lib/utils"
import { AppointmentModel } from "@/domain/model/appointment"
import { format, differenceInMinutes, differenceInHours, isBefore } from "date-fns"
import { useRouter } from "next/navigation"
import { User } from "next-auth"
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog"
import { toast } from "sonner"
import { rescheduleAppointment } from "@/actions/appointments/rescheduleAppointment"

interface AppointmentCardProps {
  appointment: AppointmentModel
  user: User
  isMobile: boolean
  onStartConsultation?: (patientId: string) => void
  onViewRecord?: (patientId: string) => void
  image: string
  name: string
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  user,
  isMobile,
  onStartConsultation,
  onViewRecord,
  image,
  name,
}) => {
  const router = useRouter()
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentModel | null>(null)
  const appointmentDate = appointment.appointmentDate
  const now = new Date()

  const isDefault = user.role === "DEFAULT"
  const isSupervisor = user.role === "SUPERVISOR"

  // CARD DESABILITADO SE A CONSULTA JÁ PASSOU
  const cardIsPast = isBefore(appointmentDate, now)

  // Diferenças de tempo
  const hoursUntilAppointment = differenceInHours(appointmentDate, now)
  const minutesUntilAppointment = differenceInMinutes(appointmentDate, now)

  // REGRAS DE REAGENDAR
  const canReschedule = (isDefault && hoursUntilAppointment > 24) || (isSupervisor && hoursUntilAppointment > 1)

  // REGRAS PARA INICIAR SESSÃO
  /*
   * PACIENTE - botão liberado 10 minutos antes de iniciar a sessão
   * PROFISSIONAL - botão liberado 30 minutos antes de iniciar a sessão
   */
  const canStartAppointment =
    (isDefault && minutesUntilAppointment <= 10 && minutesUntilAppointment >= -59) ||
    (isSupervisor && minutesUntilAppointment <= 50 && minutesUntilAppointment >= -59)

  const openRescheduleDialog = (appointment: AppointmentModel) => {
    setSelectedAppointment(appointment)
    setIsRescheduleOpen(true)
  }

  const getBorderColor = () => {
    switch (appointment.status) {
      case "COMPLETED":
        return "border-l-green-500"
      case "CANCELLED":
        return "border-l-gray-400 opacity-70"
      case "PENDING":
        return "border-l-orange-400"
      case "CONCLUDED":
        return "border-l-blue-400"
      case "CONFIRMED":
        return "border-l-purple-500"
      default:
        return "border-l-gray-400/80"
    }
  }

  const getStatusStyle = () => {
    const baseStyle = "text-xs font-semibold px-3 py-1 rounded-full"
    switch (appointment.status) {
      case "CONFIRMED":
        return cn(baseStyle, "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300")
      case "CANCELLED":
        return cn(baseStyle, "bg-gray-100 text-gray-800")
      case "PENDING":
        return cn(baseStyle, "bg-blue-100 text-blue-800")
      case "CONCLUDED":
        return cn(baseStyle, "bg-green-100 text-green-800")
      case "COMPLETED":
        return cn(baseStyle, "bg-therapy-light text-therapy-tertiary")
      default:
        return cn(baseStyle, "bg-gray-100 text-gray-800")
    }
  }
  const handleConfirmReschedule = async (appointmentId: number, date: Date) => {
    try {
      await rescheduleAppointment({ appointmentId, newAppointmentDate: date })
      toast.success("Consulta reagendada com sucesso!")

      // Atualiza lista
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao reagendar consulta.")
    }
  }

  const handleStartAppointment = () => {
    if (user.role === "DEFAULT") {
      router.push(`./app/${user?.id}/videochamada/room/${appointment.roomId}`)
    }
    router.push(`/app/professional/${user.id}/consulta?patientId=${appointment.patientId}`)
  }

  return (
    <>
      <Card
        className={cn(
          "rounded-2xl shadow-sm border-l-4 transition-opacity",
          getBorderColor(),
          cardIsPast && "opacity-50 pointer-events-none"
        )}
      >
        <CardContent className="sm:py-2 py-2 px-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          {/* Left side */}
          <div className="flex items-center gap-3 mt-1">
            <Avatar className="size-12 sm:size-14">
              {image ? (
                <AvatarImage src={image} alt={getInitials(name)} />
              ) : (
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col gap-1">
              <div className="flex gap-3 -mt-2">
                <h3 className="text-sm sm:text-base font-sans">
                  {user?.role === "SUPERVISOR" ? (
                    <span className="font-medium">{name}</span>
                  ) : (
                    <>
                      <span>Terapeuta: </span>
                      <span className="font-medium">{name}</span>
                    </>
                  )}
                </h3>
                <span className={getStatusStyle()}>{getAppointmentStatusLabel(appointment.status as any)}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {user?.role === "DEFAULT" && (
                  <div className="bg-blue-300 rounded-full px-3 py-1 my-1 text-xs text-therapy-tertiary font-semibold">
                    {format(appointmentDate, "dd/MM/yyyy")}
                  </div>
                )}

                <div className="bg-gray-200 rounded-full px-3 py-1 text-xs my-1 text-therapy-tertiary font-semibold">
                  {appointmentDate.getHours()}:00
                </div>

                {appointment.isNewPatient && (
                  <Badge className="text-xs my-auto hover:bg-emerald-100 bg-emerald-100 text-emerald-600 font-semibold px-3 py-1 rounded-full h-5">
                    Novo Paciente
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Desktop */}
          {!isMobile ? (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center sm:self-start h-20">
              {appointment.status !== "CANCELLED" && (
                <div className="sm:flex my-3 items-center gap-2">
                  {user?.role === "SUPERVISOR" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewRecord && onViewRecord(appointment.patientId)}
                      className="text-primary rounded-lg border-primary-foreground shadow-sm"
                    >
                      Ver prontuário
                    </Button>
                  )}

                  <div className="sm:flex sm:flex-col sm:items-center">
                    {appointment.status === "CONFIRMED" && (
                      <Button
                        disabled={!canStartAppointment}
                        size="sm"
                        variant="outline"
                        className="text-therapy-secondary w-full h-8"
                        onClick={handleStartAppointment}
                      >
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        Iniciar Sessão
                      </Button>
                    )}

                    {appointment.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        disabled={!canReschedule}
                        variant="outline"
                        className="text-orange-600 w-full mt-1 h-8"
                        onClick={() => openRescheduleDialog(appointment)}
                      >
                        <LucideCalendarSearch className="h-4 w-4 mr-1" />
                        Reagendar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Mobile Actions
            <div className="flex flex-col gap-2 sm:hidden w-full -mt-1 -mb-2">
              {appointment.status === "CONFIRMED" && (
                <div className="flex -mt-1">
                  <Button
                    disabled={!canReschedule}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 w-full h-8"
                    onClick={() => openRescheduleDialog(appointment)}
                  >
                    <LucideCalendarSearch className="h-4 w-4 mr-1" />
                    Reagendar
                  </Button>

                  <Button
                    disabled={!canStartAppointment}
                    size="sm"
                    variant="ghost"
                    className="text-therapy-secondary w-full h-8"
                    onClick={() => onStartConsultation && onStartConsultation(appointment.patientId)}
                  >
                    <CalendarCheck className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAppointment && (
        <RescheduleAppointmentDialog
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false)
            setSelectedAppointment(null)
          }}
          appointmentId={selectedAppointment.id}
          professionalId={appointment.professionalId}
          currentDate={selectedAppointment.appointmentDate}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}
    </>
  )
}

export default AppointmentCard
