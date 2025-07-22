"use server";

import { prisma } from "@/lib/db";

interface ScheduleVideoCallParams {
  scheduledAt: Date;
  participantUserIds: string[];
}

export async function addScheduleVideoCall({
  scheduledAt,
  participantUserIds,
}: ScheduleVideoCallParams) {
  return await prisma.videoCallRoom.create({
    data: {
      scheduledAt,
      participants: {
        create: participantUserIds.map((userId) => ({
          user: {
            connect: { id: userId },
          },
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });
}
