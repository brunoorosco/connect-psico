export type StatusAppointment = "PENDING" | "CANCELLED" | "CONFIRMED" | "COMPLETED" | "CONCLUDED"

export type AppointmentModel = {
  id: number
  patientId: string
  professionalId: string
  appointmentDate: Date
  notes?: string
  status: StatusAppointment
  roomId?: string
  tipoAtendimento?: "ambos" | "remoto" | "presencial"
  duration?: number
  review: boolean
  isNewPatient?: boolean
  isLinkedToMedicalRecord?: boolean
  createdAt?: Date
  patient: AppointmentPatient
  professional: AppointmentProfessional
}

export type AppointmentPatient = { id: string; name: string; telefone: string; email: string; image?: string }
export type AppointmentProfessional = { id: string; name: string; telefone: string; email: string; image: string; tempoConsulta: number }
export type CalendarViewType = "daily" | "weekly" | "monthly"
