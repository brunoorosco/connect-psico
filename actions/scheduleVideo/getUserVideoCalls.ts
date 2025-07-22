"use server"

import { prisma } from "@/lib/db"

export async function getUserVideoCalls(userId: string) {
  return await prisma.videoCallParticipant.findMany({
    where: {
      userId,
      room: {
        scheduledAt: {
          gte: new Date(), // Apenas chamadas futuras
        },
      },
    },
    include: {
      room: true,
    },
    orderBy: {
      room: {
        scheduledAt: "asc",
      },
    },
  })
}
