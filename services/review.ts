import { getAppointmentsByNotReview } from "@/actions/appointments/getAppointmentByNotReview"
import { ProfessionalModel } from "@/domain/model/professional"
import { Review } from "@/domain/model/review"
import { getByIdProfessional, getByIdUser } from "@/infra/db/repositories/review"

// Tipos auxiliares
export type PageParams = { page?: number; pageSize?: number }
export type Paginated<T> = { data: T[]; total: number; page: number; pageSize: number }

// ========== Services puros (funções) ==========
export async function getReviewsByUserIdService(
  userId: string,
  params?: PageParams
): Promise<Paginated<Review & { professionalName: string }>> {
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
