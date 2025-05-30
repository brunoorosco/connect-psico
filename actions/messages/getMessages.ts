"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type MessageModel = {
  id: string;
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date;
};
export const getMessages = async () => {
  const session = await auth();
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: session?.user.id,
      },
      select: {
        senderId: true,
        content: true,
        createdAt: true,
        read: true,
        sender: {
          select: {
            name: true,
          },
        },
      },
    });
    return messages as MessageModel[];
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao enviar mensagem" };
    }

    throw error;
  }
};
