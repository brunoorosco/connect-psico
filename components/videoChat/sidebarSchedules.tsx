// components/VideoCallScheduleMenu.tsx
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Phone, VideoIcon } from "lucide-react"
import { ScrollArea } from "@components/ui/scroll-area"
import { Button, Card } from "@components/ui"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAppointments } from "@hooks/useAppointments"
import { AppointmentModel } from "@/domain/model/appointment"

function getStatusColor(status: string) {
  switch (status) {
    case "waiting":
      return "bg-yellow-400"
    case "in-call":
      return "bg-green-500"
    case "finished":
      return "bg-gray-400"
    default:
      return "bg-gray-200"
  }
}

function getTypeLabel(type: string) {
  return type === "consultation" ? "Consulta" : "Outro"
}

export function VideoCallScheduleMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeCall, setActiveCall] = useState<string | null>(null)
  const { appointments, fetchAppointments } = useAppointments()

  useEffect(() => {
    if (!session?.user?.id) return
    // getUserVideoCalls(session.user.id).then(setCalls)
    fetchAppointments()
  }, [session])

  if (!session) return null

  return (
    <div className="w-full sm:w-80 bg-card sm:border-r flex flex-col">
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Agendamentos de Hoje</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {appointments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>}

          {appointments.map((appointment: AppointmentModel) => {
            // const participantName =
            //   appointment.participants.find((p: any) => p.user.id !== session.user.id)?.user.name || "Participante"
            const participantName =
              appointment.patient?.id === session.user?.id
                ? appointment.professional?.name ?? "Participante"
                : appointment.patient?.name ?? "Participante"
            return (
              <Card
                key={appointment.roomId}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  activeCall === appointment.roomId ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {participantName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{participantName}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(appointment.appointmentDate), "HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTypeLabel("Consulta")}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment.status)}`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {/* {appointment.status === "waiting"
                        ? "Aguardando"
                        : appointment.status === "in-call"
                        ? "Em chamada"
                        : "Finalizada"} */}
                      andamento da consulta ...
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => {
                      setActiveCall(appointment.roomId)
                      router.push(`./videochamada/room/${appointment.roomId}`)
                    }}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Entrar
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
