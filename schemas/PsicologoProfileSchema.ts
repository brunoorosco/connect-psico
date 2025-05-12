import * as z from "zod";

// Define a schema for time intervals
const timeIntervalSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

export const profileSchema = z.object({
  name: z.string().min(3, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  profilePhoto: z.string().optional(),
  bio: z.string().min(10, { message: "Biografia é obrigatória" }).max(500),

  professionalId: z.string().min(3, { message: "Registro profissional é obrigatório" }),
  specialties: z.array(z.string()).min(1, { message: "Selecione pelo menos uma especialidade" }),
  education: z.string().min(5, { message: "Formação é obrigatória" }),
  experience: z.number().min(0, { message: "Experiência inválida" }),
  targetAudience: z.array(z.string()).min(1, { message: "Selecione pelo menos um público" }),
  
  sessionDuration: z.number().min(30, { message: "Duração mínima é de 30 minutos" }).max(120),
  sessionPrice: z.number().min(50, { message: "Valor mínimo é de R$50" }),
  appointmentType: z.enum(["remote", "presential", "both"], { 
    message: "Selecione o tipo de atendimento"
  }),
  
  availableDays: z.array(z.string()).min(1, { message: "Selecione pelo menos um dia disponível" }),
  
  // Changed from a single interval to an array of intervals
  availableHours: z.array(timeIntervalSchema).min(1, { message: "Adicione pelo menos um intervalo de horário" }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type TimeInterval = z.infer<typeof timeIntervalSchema>;

export const defaultProfileValues: Partial<ProfileFormValues> = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  professionalId: "",
  specialties: [],
  education: "",
  experience: 0,
  sessionDuration: 50,
  sessionPrice: 150,
  appointmentType: "both",
  availableDays: [],
  availableHours: [
    {
      startTime: "08:00",
      endTime: "13:00",
    },
    {
      startTime: "15:00",
      endTime: "18:00",
    }
  ],
  targetAudience: [],
};

export const specialties = [
  "Terapia Cognitivo-Comportamental",
  "Psicanálise",
  "Psicologia Humanista",
  "Terapia Familiar",
  "Terapia de Casal",
  "Neuropsicologia",
  "Psicologia Infantil",
  "Psicologia do Esporte",
  "Psicologia Organizacional",
  "Psicologia Educacional",
];

export const audiences = [
  "Crianças",
  "Adolescentes",
  "Adultos",
  "Idosos",
  "Casais",
  "Famílias",
  "Empresas",
];

export const weekdays = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];
