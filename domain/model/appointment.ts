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
  isLinkedToMedicalRecord?: boolean
  createdAt?: Date
  patient: { id: string; name: string; telefone: string; email: string }
  professional: { id: string; name: string; telefone: string; email: string }
}

export type CalendarViewType = "daily" | "weekly" | "monthly"
