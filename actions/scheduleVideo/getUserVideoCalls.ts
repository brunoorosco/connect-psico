"use server"

import { prisma } from "@/lib/db"

export async function getUserVideoCalls(userId: string) {
  const now = new Date()

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const resp = await prisma.videoCallParticipant.findMany({
    where: {
      userId,
      room: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
    include: {
      room: {
        include: {
          participants: {
            include: {
              user: true, // <- Aqui traz os dados do usuário
            },
          },
        },
      },
    },
    orderBy: {
      room: {
        scheduledAt: "asc",
      },
    },
  })
  console.log(resp)
  return Array.from(
  new Map(resp.map((i) => [i.room.id, i.room])).values()
)
}
