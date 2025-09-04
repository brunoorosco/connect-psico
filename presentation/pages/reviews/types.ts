import { z } from "zod"
export type Therapist = {
  id: string
  name: string
  appointment_id?: string
  appointment_date?: string
}

export type Review = {
  id: string
  therapist_id: string
  appointment_id?: string
  rating: number
  comment: string
  created_at: string
  therapist_name?: string
}

export const reviewSchema = z.object({
  therapist_id: z.string().min(1, "Selecione um terapeuta"),
  rating: z.number().min(1, "Selecione uma nota").max(5, "Nota máxima é 5"),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres"),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
