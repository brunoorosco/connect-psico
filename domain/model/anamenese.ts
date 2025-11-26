import { z } from "zod"

export const AnamnesisAdultSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  fullName: z.string().min(3, "Nome é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  referredBy: z.string().optional(),

  currentComplaint: z.string().min(5, "Descreva a queixa principal"),
  complaintHistory: z.string().optional(),
  previousTreatment: z.string().optional(),
  medications: z.string().optional(),

  familyHistory: z.string().optional(),
  personalHistory: z.string().optional(),

  sleepPattern: z.string().optional(),
  appetite: z.string().optional(),
  mood: z.string().optional(),
  anxiety: z.string().optional(),
  stressLevel: z.string().optional(),

  suicidalThoughts: z.boolean(),
  selfHarm: z.boolean(),
  violence: z.boolean(),

  additionalInfo: z.string().optional(),

  consent: z.boolean().refine((v) => v === true, {
    message: "Você precisa aceitar o termo de consentimento.",
  }),
})

export type AnamnesisAdultModel = z.infer<typeof AnamnesisAdultSchema>
