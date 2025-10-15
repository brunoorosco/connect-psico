import { PatientModel } from "./patient"

export type StatusAppointment = "PENDING" | "CANCELLED" | "CONFIRMED" | "COMPLETED" | "CONCLUDED"
export type CalendarViewType = "daily" | "weekly" | "monthly"

export type AppointmentModel = {
  id: number
  patientId: string
  professionalId: string
  appointmentDate: Date
  notes?: string
  status: StatusAppointment
  roomId: string | null
  tipoAtendimento?: "ambos" | "remoto" | "presencial"
  duration?: number | null
  review?: boolean
  isLinkedToMedicalRecord?: boolean
  createdAt?: Date
  patient: { id: string; name: string; telefone?: string; email?: string }
  professional: { id: string; name: string; telefone?: string; email?: string }
}


export type User = {
  id: number
  name: string
  email?: string
  phone?: string
  medicalRecordId?: string
  username?: string
}

// export type Patient = User & {
//   cep: string
//   state: string
//   street: string
//   neighborhood: string
//   emergencyContact: string
//   birthDate?: string
//   city: string
//   number: string
//   notes: string
//   active: boolean
//   image?: string
//   userId: string
//   cpf?: string
//   rg?: string
// }

export type Professional = User

export type Appointment = {
  id: string
  professionalId: string
  patientId: string
  appointmentDate: string // ISO string format
  status: StatusAppointment
  createdAt: string // ISO string format
  // Relations (optional for frontend display)
  patient?: PatientModel
  professional?: Professional
  // Legacy fields for display (derived from appointmentDate)
  date?: string
  startTime?: string
  endTime?: string
  notes?: string
  patientName?: string
  isLinkedToMedicalRecord?: boolean
}

export type Availability = {
  id: string
  professionalId: string
  dayOfWeek: number // 0-6 (Sunday to Saturday)
  startTime: string // ISO string format or HH:MM
  endTime: string // ISO string format or HH:MM
  isAvailable: boolean
  psychologist?: Professional
}
