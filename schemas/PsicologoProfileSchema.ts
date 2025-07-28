import * as z from "zod"

const especialidadesSemCRP = ["Coach", "Psicanálise"]

export const profileSchema = z
  .object({
    name: z.string().min(3, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    phone: z.string().min(10, { message: "Telefone inválido" }),
    profilePhoto: z.any().optional(),
    isProfileCompleted: z.boolean().default(false),
    bio: z.string({ message: "Obrigatório" }).min(10, { message: "Biografia é obrigatória" }).max(500),
    numConselho: z.string().optional(),
    ufConselho: z.string().optional(),
    especialidade: z.array(z.string()).min(1, { message: "Selecione pelo menos uma especialidade" }),
    education: z.string({ message: "Obrigatório" }).min(5, { message: "Formação é obrigatória" }),
    experiencia: z.number({ message: "Obrigatório" }).min(0, { message: "Experiência inválida" }),
    publicoAlvo: z.array(z.string()).min(1, { message: "Selecione pelo menos um público" }),
    tempoConsulta: z.number().min(30, { message: "Duração mínima é de 30 minutos" }).max(120),
    valorAtendimento: z.number().min(0, { message: "Valor mínimo é de R$50" }),
    tipoAtendimento: z.enum(["remoto", "presencial", "ambos"], {
      message: "Selecione o tipo de atendimento",
    }),
  })
  .superRefine((data, ctx) => {
    const especialidades = data.especialidade || []

    const exigeCRP = especialidades.length > 0 &&
      especialidades.some((esp) => !especialidadesSemCRP.includes(esp))

    if (exigeCRP) {
      if (!data.numConselho || data.numConselho.trim().length < 3) {
        ctx.addIssue({
          path: ["numConselho"],
          code: z.ZodIssueCode.custom,
          message: "Número do conselho é obrigatório para essa especialidade",
        })
      }

      if (!data.ufConselho || data.ufConselho.trim().length < 2) {
        ctx.addIssue({
          path: ["ufConselho"],
          code: z.ZodIssueCode.custom,
          message: "UF do conselho é obrigatória para essa especialidade",
        })
      }
    }
  })

export type ProfileFormValues = z.infer<typeof profileSchema>

export const defaultProfileValues: Partial<ProfileFormValues> = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  numConselho: "",
  ufConselho: "",
  profilePhoto: "",
  especialidade: [],
  education: "",
  isProfileCompleted: false,
  experiencia: 0,
  tempoConsulta: 50,
  valorAtendimento: 0,
  tipoAtendimento: "ambos",
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
