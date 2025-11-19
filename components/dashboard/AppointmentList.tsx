"use client"
import React, { useState } from "react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarCheck, LucideCalendarSearch } from "lucide-react"
import { useSession } from "next-auth/react"
import { getAppointmentStatusLabel } from "@/utils/getAppointmentStatus"
import { AppointmentModel } from "@/domain/model/appointment"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { getInitials } from "@/utils/getInitialsName"
import CancelAppointmentDialog from "./CancelApointmentModalMobile"
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@hooks/use-mobile"
import { isCancelDisabled } from "@/utils/isCancelDisabled"
import { rescheduleAppointment } from "@/actions/appointments/rescheduleAppointment"
import { toast } from "sonner"
import AppointmentCard from "./AppointmentCard"
import { useCurrentUser } from "@hooks/use-current-user"

interface AppointmentsListProps {
  appointments: AppointmentModel[]
  selectedDate: Date
  userRole: "SUPERVISOR" | "DEFAULT"
  onViewRecord?: (patientId: string) => void
  professionalId: string // Adicione esta prop
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  selectedDate,
  userRole,
  onViewRecord,
  professionalId,
}) => {
  const isToday = isSameDay(selectedDate, new Date())
  const user = useCurrentUser()
  const mobile = useIsMobile()

  if (!user) return

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Estados para modal de reagendamento
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentModel | null>(null)

  const filteredAppointments = appointments?.filter((a) => isSameDay(a.appointmentDate, selectedDate))

  const handleStartConsultation = (patientId: string) => {
    window.location.href = `/app/professional/${user.id}/consulta?patientId=${patientId}`
  }

  const openCancelDialog = (id: number) => {
    setSelectedId(id)
    setIsDialogOpen(true)
  }

  const openRescheduleDialog = (appointment: AppointmentModel) => {
    setSelectedAppointment(appointment)
    setIsRescheduleOpen(true)
  }

  const handleCancelConsultation = async (id: number | null, reason: string) => {
    if (!id) return
    console.log("Motivo do cancelamento:", reason)
    setIsDialogOpen(false)
    setSelectedId(null)
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
            // <Card
            //   key={appointment.id}
            //   className={`rounded-2xl shadow-sm border-l-4 ${
            //     appointment.status === "COMPLETED"
            //       ? "border-l-green-500"
            //       : appointment.status === "CANCELLED"
            //       ? "border-l-gray-400 opacity-70"
            //       : appointment.status === "PENDING"
            //       ? "border-l-orange-400"
            //       : "border-l-purple-600/80"
            //   }`}
            // >
            //   <CardContent className="sm:py-1 py-2 px-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center ">
            //     {/* Left side */}
            //     <div className="flex items-center gap-3">
            //       <Avatar className="size-12 sm:size-14 my-1">
            //         {appointment.patient.image ? (
            //           <AvatarImage src={appointment.patient.image} alt={getInitials(appointment.patient.name)} />
            //         ) : (
            //           <AvatarFallback>{getInitials(appointment.patient.name)}</AvatarFallback>
            //         )}
            //       </Avatar>

            //       <div className="flex flex-col gap-1">
            //         <div className="flex gap-3">
            //           <h3 className="font-medium text-sm sm:text-base">
            //             {userRole === "SUPERVISOR" ? appointment.patient.name : "Consulta Psicológica"}
            //           </h3>
            //           {/* Status tag */}
            //           <span
            //             className={cn(
            //               "text-xs font-semibold px-3 py-1 rounded-full",
            //               appointment.status === "CONFIRMED" &&
            //                 "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300",
            //               appointment.status === "CANCELLED" && "bg-gray-100 text-gray-800",
            //               appointment.status === "PENDING" && "bg-blue-100 text-blue-800",
            //               appointment.status === "CONCLUDED" && "bg-green-100 text-green-800",
            //               appointment.status === "COMPLETED" && "bg-therapy-light text-therapy-tertiary",
            //               !["CONFIRMED", "CANCELLED", "PENDING", "CONCLUDED", "COMPLETED"].includes(
            //                 appointment.status
            //               ) && "bg-gray-100 text-gray-800"
            //             )}
            //           >
            //             {getAppointmentStatusLabel(appointment.status as any)}
            //           </span>
            //         </div>
            //         <div className="flex flex-wrap gap-2">
            //           <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-therapy-tertiary font-semibold">
            //             {appointment.appointmentDate.getHours()}:00
            //           </div>

            //           {appointment.isNewPatient && (
            //             <Badge className="text-[0.65rem] hover:bg-emerald-100 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 font-semibold px-3 py-1 rounded-full">
            //               Novo Paciente
            //             </Badge>
            //           )}
            //         </div>
            //       </div>
            //     </div>
            //     {!mobile ? (
            //       <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center sm:self-start h-20">
            //         {userRole === "SUPERVISOR" && appointment.status !== "CANCELLED" && (
            //           <div className="sm:flex my-3 items-center gap-2">
            //             <Button
            //               size="sm"
            //               variant="outline"
            //               onClick={() => onViewRecord && onViewRecord(appointment.patientId)}
            //               className="text-primary rounded-lg border-primary-foreground shadow-sm"
            //             >
            //               Ver prontuário
            //             </Button>
            //             <div className="sm:flex sm:flex-col sm:items-center">
            //               {appointment.status === "CONFIRMED" && (
            //                 <Button
            //                   disabled={!isToday}
            //                   size="sm"
            //                   variant="outline"
            //                   className="text-therapy-secondary w-full h-8"
            //                   onClick={() => handleStartConsultation(appointment.patientId)}
            //                 >
            //                   <CalendarCheck className="h-4 w-4 mr-1" />
            //                   Iniciar Sessão
            //                 </Button>
            //               )}
            //               {appointment.status === "CONFIRMED" && (
            //                 <Button
            //                   size="sm"
            //                   disabled={isCancelDisabled(appointment.appointmentDate)}
            //                   variant="outline"
            //                   className="text-orange-600 w-full mt-1 h-8"
            //                   onClick={() => openRescheduleDialog(appointment)}
            //                 >
            //                   <LucideCalendarSearch className="h-4 w-4 mr-1" />
            //                   Reagendar
            //                 </Button>
            //               )}
            //             </div>
            //           </div>
            //         )}
            //       </div>
            //     ) : (
            //       <div className="flex flex-col gap-2 sm:hidden w-full -mt-1 -mb-2">
            //         {appointment.status === "CONFIRMED" && (
            //           <div className="flex -mt-1">
            //             <Button
            //               disabled={isCancelDisabled(appointment.appointmentDate)}
            //               size="sm"
            //               variant="ghost"
            //               className="text-red-500 w-full h-8"
            //               onClick={() => openRescheduleDialog(appointment)}
            //             >
            //               <LucideCalendarSearch className="h-4 w-4 mr-1" />
            //               Reagendar
            //             </Button>

            //             <Button
            //               disabled={!isToday}
            //               size="sm"
            //               variant="ghost"
            //               className="text-therapy-secondary w-full h-8"
            //               onClick={() => handleStartConsultation(appointment.patientId)}
            //             >
            //               <CalendarCheck className="h-4 w-4 mr-1" />
            //               Iniciar
            //             </Button>
            //           </div>
            //         )}
            //       </div>
            //     )}
            //   </CardContent>
            // </Card>
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isMobile={mobile}
              isToday={isToday}
              user={user}
              image={appointment?.patient.image ?? ""}
              name={appointment.patient.name}
            />
          ))}
      </div>

      {/* Modal de cancelamento */}
      <CancelAppointmentDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onConfirmCancel={(id: number, reason: string) => handleCancelConsultation(id, reason)}
      />

      {/* Modal de reagendamento */}
      {selectedAppointment && (
        <RescheduleAppointmentDialog
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false)
            setSelectedAppointment(null)
          }}
          appointmentId={selectedAppointment.id}
          professionalId={professionalId}
          currentDate={selectedAppointment.appointmentDate}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}
    </>
  )
}

export default AppointmentsList
