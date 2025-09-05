import type { Review } from "@/domain/model/review"

// =========================
// Helpers
// =========================
export function toReview(row: {
  id: number
  professionalId: string
  appointmentId: number
  rating: number
  comment: string
  createdAt: Date
}): Review {
  return {
    id: String(row.id),
    profissionalId: row.professionalId,
    appointmentId: String(row.appointmentId),
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  }
}

export function parseIntStrict(value: number | string): number {
  if (typeof value === "number") return value
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) throw new Error(`Valor numérico inválido: ${value}`)
  return n
}
