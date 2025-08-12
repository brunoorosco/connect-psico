export type NotePatient = {
  id: number
  patientId: number
  notes: string
  prescription: string
  professionalId: string
  createdAt?: Date
}
