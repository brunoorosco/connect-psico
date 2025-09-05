import { Review } from "@/domain/model/review"
import { z } from "zod"

export const reviewSchema = z.object({
  profissionalId: z.string().min(1, "Selecione um terapeuta"),
  rating: z.number().min(1, "Selecione uma nota").max(5, "Nota máxima é 5"),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres"),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

export type ReviewPage = { review: Review & { profissinallName: string } }

export type ProfissionalReview = { id: string; name: string }
