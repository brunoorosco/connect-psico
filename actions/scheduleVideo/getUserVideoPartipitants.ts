"use server"

import { User } from "@/domain/model/user"
import { prisma } from "@/lib/db"

export interface TResponseVidelCall {
  scheduledAt: Date
  id: string
  createdAt: Date
  participants: Participants[]
}

type Participants = {
  id: number
  roomId: string
  userId: string
  user: User
  joinedAt: Date
}

export async function getVideoCall(id: string): Promise<TResponseVidelCall> {
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

  if (!room) throw { message: "Sala não encontrada" }
  //@ts-ignore
  return room
}
