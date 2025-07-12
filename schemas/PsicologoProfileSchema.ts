import * as z from "zod"

// Define a schema for time intervals
const timeIntervalSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
})

export const profileSchema = z.object({
  name: z.string().min(3, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  profilePhoto: z.any().optional(),
  isProfileCompleted: z.boolean().default(false),
  bio: z.string().min(10, { message: "Biografia é obrigatória" }).max(500),
  numConselho: z.string().min(3, { message: "Número do conselho é obrigatório" }),
  ufConselho: z.string().min(2, { message: "UF do conselho é obrigatória" }),
  professionalId: z.number({ message: "Registro profissional é obrigatório" }),
  especialidade: z.array(z.string()).min(1, { message: "Selecione pelo menos uma especialidade" }),
  education: z.string().min(5, { message: "Formação é obrigatória" }),
  experiencia: z.number().min(0, { message: "Experiência inválida" }),
  publicoAlvo: z.array(z.string()).min(1, { message: "Selecione pelo menos um público" }),
  tempoConsulta: z.number().min(30, { message: "Duração mínima é de 30 minutos" }).max(120),
  valorAtendimento: z.number().min(49, { message: "Valor mínimo é de R$50" }),
  tipoAtendimento: z.enum(["remoto", "presencial", "ambos"], {
    message: "Selecione o tipo de atendimento",
  }),
  availableDays: z.array(z.string()).min(1, { message: "Selecione pelo menos um dia disponível" }).optional(),

  // Changed from a single interval to an array of intervals
  availableHours: z
    .array(timeIntervalSchema)
    .min(1, { message: "Adicione pelo menos um intervalo de horário" })
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type TimeInterval = z.infer<typeof timeIntervalSchema>

export const defaultProfileValues: Partial<ProfileFormValues> = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  numConselho: "",
  ufConselho: "",
  professionalId: 0,
  profilePhoto: "",
  especialidade: [],
  education: "",
  isProfileCompleted: false,
  experiencia: 0,
  tempoConsulta: 50,
  valorAtendimento: 150,
  tipoAtendimento: "ambos",
  availableDays: [],
  availableHours: [
    {
      startTime: "08:00",
      endTime: "13:00",
    },
    {
      startTime: "15:00",
      endTime: "18:00",
    },
  ],
  publicoAlvo: [],
}

export const publicoAlvo = ["Crianças", "Adolescentes", "Adultos", "Idosos", "Casais", "Famílias", "Empresas"]

export const weekdays = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
]
