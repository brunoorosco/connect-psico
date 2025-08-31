"use client"
import React, { useEffect } from "react"
import DashboardHeader from "./DashboardHeader"
import { Card, CardContent } from "@/components/ui/card"
import { useAppointmentsByPatient } from "@/hooks/useAppointments"
import { AppointmentModel } from "@/domain/model/appointment"
import { getSession } from "next-auth/react"
import { useCurrentUser } from "@hooks/use-current-user"

const PatientDashboard: React.FC = () => {
  const { appointments, total, loading, fetchAppointments } = useAppointmentsByPatient()
  const user = useCurrentUser()

  useEffect(() => {
    getSession()
    fetchAppointments()
  }, [])

  const HOUR = 60 * 60 * 1000
  const now = Date.now()

  // helper pra garantir sempre timestamp UTC
  const toMs = (d: Date | string | number) => (d instanceof Date ? d.getTime() : new Date(d).getTime())

  const list = Array.isArray(appointments) ? appointments : []

  const pastAppointments = list.filter((app: AppointmentModel) => toMs(app.appointmentDate) < now - HOUR)

  const nextAppointments = list.filter((app: AppointmentModel) => {
    const appTime = toMs(app.appointmentDate)
    return appTime >= now - HOUR && appTime <= now + HOUR
  })

  return (
    <div className="space-y-4 mt-4 px-4 sm:px-6 lg:px-6">
      <DashboardHeader title="Meu Acompanhamento" subtitle="Histórico e agenda de consultas" userRole="DEFAULT" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximas Consultas</h2>
            {/* <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} /> */}
            {/* <AppointmentsList 
              appointments={futureAppointments}
              selectedDate={selectedDate}
              userRole="DEFAULT"
            /> */}
            {nextAppointments &&
              nextAppointments.map((consulta: AppointmentModel) => (
                <Card key={consulta.id} className="therapy-card border-l-4 border-l-green-400 mb-2">
                  <CardContent className="p-2 pl-4">
                    <div className="flex justify-between items-start text-sm">
                      {/* Lado esquerdo: Nome + Local ou Link */}
                      <div className="flex flex-col">
                        <pre>{JSON.stringify(consulta, null, 2)}</pre>
                        <div className="font-medium">
                          Consulta com: <b>{consulta.professional.name}</b>
                        </div>
                        {consulta.tipoAtendimento === "presencial" ? (
                          <p className="text-green-600 font-medium">Local: --</p>
                        ) : (
                          <a
                            href={`./app/${user?.id}/videochamada/room/${consulta.roomId}`}
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-medium"
                          >
                            Link para consulta
                          </a>
                        )}
                      </div>

                      {/* Lado direito: Data e Horário */}
                      <WrapperDateTime consulta={consulta.appointmentDate} />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultas Anteriores</h2>
            <div className="space-y-3">
              {pastAppointments?.map((appointment: AppointmentModel) => (
                <Card key={appointment.id} className="therapy-card border-l-4 border-l-slate-400">
                  <CardContent className="p-2">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-xs text-gray-500">
                          Consulta com {appointment.professional.name || "Nome do Médico"}
                        </h3>
                      </div>
                      <WrapperDateTime consulta={appointment.appointmentDate} />
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded">{appointment.notes}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seu Progresso</h2>
          <Card className="therapy-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-therapy-tertiary">
                Notas de Evolução
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {mockProgressNotes.map((note, index) => (
                  <div key={note.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="mb-1 flex justify-between">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}
export default PatientDashboard

type TProps = {
  consulta: Date
}
const WrapperDateTime = ({ consulta }: TProps) => {
  return (
    <div className="text-right font-xs">
      <div className="">
        <label className="text-sm text-muted-foreground mr-1">Data:</label>
        <label className="text-gray-600 font-semibold">
          {String(consulta.getUTCDate()).padStart(2, "0")}/{String(consulta.getUTCMonth() + 1).padStart(2, "0")}/
          {consulta.getUTCFullYear()}
        </label>
      </div>
      <div className="">
        <label className="text-sm text-muted-foreground mr-1">Horário:</label>
        <label className="text-gray-600 font-semibold">
          {String(consulta.getUTCHours() - 3).padStart(2, "0")}h{String(consulta.getUTCMinutes()).padStart(2, "0")}m
        </label>
      </div>
    </div>
  )
}
