"use server"

import { prisma } from "@/lib/db"
import type { Review } from "@/domain/model/review"
import { Prisma } from "@prisma/client"
import { toReview } from "./helpers"

type Response = {
  data: Review[]
  total: number
  page: number
  pageSize: number
  averageRating: number | null
}

export async function getByIdProfessional(
  professionalId: string,
  params?: { page?: number; pageSize?: number }
): Promise<Response> {
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, params?.pageSize ?? 20))
  const skip = (page - 1) * pageSize
  const take = pageSize

  const where: Prisma.ComentariosWhereInput = { professionalId }

  const [rows, total, agg] = await Promise.all([
    prisma.comentarios.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        professionalId: true,
        appointmentId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    }),
    prisma.comentarios.count({ where }),
    prisma.comentarios.aggregate({ where, _avg: { rating: true } }),
  ])

  return {
    data: rows.map(toReview),
    total,
    page,
    pageSize,
    averageRating: agg._avg.rating ?? null,
  }
}
