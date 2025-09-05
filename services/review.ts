import { getAppointmentsByNotReview } from "@/actions/appointments/getAppointmentByNotReview"
import { AppointmentModel } from "@/domain/model/appointment"
import { ProfessionalModel } from "@/domain/model/professional"
import { Review } from "@/domain/model/review"
import { createReview, CreateReviewDTO, getByIdProfessional, getByIdUser } from "@/infra/db/repositories/review"

// Tipos auxiliares
export type PageParams = { page?: number; pageSize?: number }
export type Paginated<T> = { data: T[]; total: number; page: number; pageSize: number }

// ========== Services puros (funções) ==========
export async function getReviewsByUserIdService(userId: string, params?: PageParams): Promise<Paginated<Review>> {
  if (!userId) throw new Error("userId é obrigatório")
  const resp = getByIdUser(userId, params)
  return resp
}

export async function getReviewsByProfessionalIdService(
  professionalId: string,
  params?: PageParams
): Promise<Paginated<Review> & { averageRating: number | null }> {
  if (!professionalId) throw new Error("professionalId é obrigatório")
  return getByIdProfessional(professionalId, params)
}

export async function createReviewService(input: CreateReviewDTO): Promise<Review> {
  // Regras simples (adicione Zod se quiser validações mais ricas)
  if (!input.userId) throw new Error("userId é obrigatório")
  if (!input.professionalId) throw new Error("professionalId é obrigatório")
  if (input.rating == null) throw new Error("rating é obrigatório")
  if (input.rating < 1 || input.rating > 5) throw new Error("rating deve estar entre 1 e 5")
  if (!input.appointmentId && input.appointmentId !== 0) throw new Error("appointmentId é obrigatório")

  return createReview(input)
}

export async function reviewOpenByAppointmentService(userId: string) {
  const appointments = await getAppointmentsByNotReview()
  const unique = new Map<string, ProfessionalModel>()
  for (const appt of appointments) {
    const prof = appt.professional
    // @ts-ignore
    if (prof?.id) unique.set(prof.id, { id: prof.id, name: prof.name })
  }

  const profissional = Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
  return { appointments, profissional }
}
