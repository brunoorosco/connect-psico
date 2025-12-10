export type Patient = {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
}

export type Appointment = {
  id: number
  day: number
  startTime: string
  endTime: string
  patient: Patient
  procedure: string
  professional: string
  room: string
  status: "confirmed" | "pending" | "cancelled"
  color: string
  notes: string
  fullDate?: Date
}

export type DayObject = {
  day: number
  isCurrentMonth: boolean
}

export type WeekDate = {
  day: number
  weekDay: string
  isToday: boolean
  fullDate: Date
}

export type SelectedSlot = {
  day: number
  time: string
  fullDate?: Date
}
