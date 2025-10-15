import * as z from "zod"

export const patientSchema = z.object({
  medicalRecordId: z.string(),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  patientId: z.string().cuid().optional(),
  professionalId: z.string().cuid(),
  cep: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  number: z.string().optional(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  name: z.string()
})

export type PatientInput = z.infer<typeof patientSchema>

export type PatientModel = z.infer<typeof patientSchema>

export type UserChat = {
  id: number
  name: string
  userId: string
  image: string
  isOnline: boolean
  role: "USER" | "SUPERVISOR" | "ADMIN"
  // type: "patient"
  // professionalId: string
}

export type ProfessionalChat = {
  id: string
  name: string
  userId: string
  image: string
  // type: "professional"
  // patients: Patient[]
}
