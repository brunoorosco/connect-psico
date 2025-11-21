"use client"
import React, { useEffect, useState } from "react"
import DashboardHeader from "./DashboardHeader"
import { Card } from "@/components/ui/card"
import { useAppointmentsByPatient } from "@/hooks/useAppointments"
import { AppointmentModel } from "@/domain/model/appointment"
import { getSession } from "next-auth/react"
import { useCurrentUser } from "@hooks/use-current-user"
import AppointmentCard from "./AppointmentCard"
import { useIsMobile } from "@hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarX2 } from "lucide-react"
import { useSocket } from "@/infra/contexts/SocketContext"

const PatientDashboard: React.FC = () => {
  const { appointments, loading, fetchAppointments } = useAppointmentsByPatient()
  const user = useCurrentUser()
  const mobile = useIsMobile()
  const { socket } = useSocket()

  useEffect(() => {
    getSession()
    fetchAppointments()
  }, [])

  useEffect(() => {
    if (!socket) return

    const refetch = () => {
      fetchAppointments()
    }

    socket.on("appointment:updated", refetch)

    return () => {
      socket.off("appointment:updated", refetch)
    }
  }, [socket])

  if (!user) return null

  // Normalizando datas
  const now = new Date().getTime()
  const toMs = (d: any) => new Date(d).getTime()

  const list: AppointmentModel[] = Array.isArray(appointments) ? appointments : []

  const future = list.filter((a) => toMs(a.appointmentDate) >= now)
  const past = list.filter((a) => toMs(a.appointmentDate) < now)

  // ========== COMPONENTES DE APOIO ==========
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <Card key={n} className="p-4">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ))}
    </div>
  )

  const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center text-center p-10 text-gray-500">
      <CalendarX2 className="w-12 h-12 mb-3 opacity-60" />
      <p className="text-md font-medium">{label}</p>
    </div>
  )

  return (
    <div className="space-y-8 mt-4 px-4 sm:px-6 lg:px-6">
      <DashboardHeader title="Meu Acompanhamento" subtitle="Histórico e agenda de consultas" userRole="DEFAULT" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-12">
          {/* =================== PRÓXIMAS =================== */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Consultas</h2>
            {future.length > 0 && (
              <p className="text-base text-yellow-600 bg-yellow-100 px-2 py-1 rounded-sm border border-yellow-300 mb-1">
                O botão "Iniciar Sessão" será liberado 10 minutos antes do início da sessão.
              </p>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : future.length === 0 ? (
              <EmptyState label="Você ainda não tem consultas agendadas" />
            ) : (
              future.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isMobile={mobile}
                  user={user}
                  image={appointment.professional.image}
                  name={appointment.professional.name}
                />
              ))
            )}
          </section>

          {/* =================== ANTERIORES =================== */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultas Anteriores</h2>

            {loading ? (
              <LoadingSkeleton />
            ) : past.length === 0 ? (
              <EmptyState label="Nenhuma consulta realizada até o momento" />
            ) : (
              past.map((appointment) => (
                <div className="mb-2">
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isMobile={mobile}
                    user={user}
                    image={appointment.professional.image}
                    name={appointment.professional.name}
                  />
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
