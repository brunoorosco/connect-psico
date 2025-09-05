"use server"

import { Review } from "@/domain/model/review"
import { prisma } from "@/lib/db"
import { toReview } from "./helpers"

export type CreateReviewDTO = {
  userId: string
  professionalId: string
  appointmentId: number
  rating: number
  comment: string
}

export async function createReviewRepository(input: CreateReviewDTO): Promise<Review> {
  const created = await prisma.comentarios.create({
    data: {
      userId: input.userId,
      professionalId: input.professionalId,
      appointmentId: input.appointmentId,
      rating: input.rating,
      comment: input.comment,
    },
    select: {
      id: true,
      professionalId: true,
      professional: { select: { name: true } },
      appointmentId: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  })
  return toReview(created)
}
