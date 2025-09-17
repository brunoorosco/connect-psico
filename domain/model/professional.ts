import { User } from "./user"

export type AvailableSlot = {
  date: Date
  time: string
}

type Professional = {
  id: number
  especialidade: string[]
  experiencia?: string
  abordagem: string
  bio: string
  isProfileCompleted: boolean
  valorAtendimento: string
  education: string
  tempoConsulta: number
  publicoAlvo: string[]
  numConselho: string
  userId: string
  ufConselho: string
  tipoAtendimento: "remoto" | "presencial" | "ambos"
  createdAt: Date
  udpatedAt: Date
  phone: string
}

export type Address = {
  cidade?: string
  bairro?: string
  estado?: string
  logradouro?: string
  numero?: string
  complemento?: string
  cep?: string
}

export type ProfessionalModel = Professional & User & Address
