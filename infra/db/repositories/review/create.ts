"use server"

import { Review } from "@/domain/model/review"
import { prisma } from "@/lib/db"
import { parseIntStrict, toReview } from "./helpers"

export type CreateReviewDTO = {
    userId: string
    professionalId: string
    appointmentId: number | string
    rating: number
    comment: string
  }

export async function createReview(input: CreateReviewDTO): Promise<Review> {
    const created = await prisma.comentarios.create({
      data: {
        userId: input.userId,
        professionalId: input.professionalId,
        appointmentId: parseIntStrict(input.appointmentId),
        rating: input.rating,
        comment: input.comment,
      },
      select: {
        id: true,
        professionalId: true,
        appointmentId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    })
    return toReview(created)
  }