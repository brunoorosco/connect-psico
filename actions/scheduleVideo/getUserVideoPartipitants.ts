"use server"

import { prisma } from "@/lib/db"

export async function getVideoCall(id: string) {
  console.log(id)
  const room = await prisma.videoCallRoom.findUnique({
    where: { id: id as string },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!room) return { message: "Sala não encontrada" }
  console.log(room)
  return room
}
