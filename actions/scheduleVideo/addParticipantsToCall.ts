"use server";

import { prisma } from "@/lib/db";
interface AddParticipantsParams {
  roomId: string;
  userIds: string[];
}

export async function addParticipantsToCall({
  roomId,
  userIds,
}: AddParticipantsParams) {
  return await prisma.videoCallParticipant.createMany({
    data: userIds.map((userId) => ({
      userId,
      roomId,
    })),
    skipDuplicates: true, // evita inserir se já existir
  });
}
