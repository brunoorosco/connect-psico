export type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "CONCLUDED"

export type User = {
  id: number
  name: string
  email?: string
  phone?: string
  medicalRecordId?: string
}

export type Patient = User & {
  cep: string
  state: string
  street: string
  neighborhood: string
  emergencyContact: string
  birthDate?: string
  city: string
  number: string
  notes: string
  active: boolean
  image?: string
  userId: string
  cpf?: string
  rg?: string
}

export type Professional = User

export type Appointment = {
  id: string
  professionalId: string
  patientId: string
  appointmentDate: string // ISO string format
  status: Status
  createdAt: string // ISO string format
  // Relations (optional for frontend display)
  patient?: Patient
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

export type CalendarViewType = "daily" | "weekly" | "monthly"
