import z from "zod"
import { User } from "./user"

export type AvailableSlot = {
  date: Date
  time: string
}

export type TProfessional = {
  id: number
  especialidade: string[]
  experiencia?: string
  abordagem: string
  bio: string
  isProfileCompleted: boolean
  valorAtendimento: number
  education: string
  tempoConsulta: number
  publicoAlvo: string[]
  numConselho: string
  userId: string
  ufConselho: string
  tipoAtendimento: "remoto" | "presencial" | "ambos"
  createdAt: Date
  updatedAt: Date
  phone: string
  username: string
}

export const addressSchema = z.object({
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  estado: z.string().min(2, "Informe o estado (ex: SP)").max(2).optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  cep: z
    .preprocess((val) => {
      if (typeof val === "string") return val.replace(/\D/g, "")
      return val
    }, z.string().length(8, "CEP deve ter 8 dígitos"))
    .optional(),
})

export type Address = z.infer<typeof addressSchema>

export type ProfessionalModel = TProfessional & User & Address
