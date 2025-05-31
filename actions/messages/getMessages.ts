"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type MessageModel = {
  senderId: string;
  sender: { name: string };
  content: string;
  read: boolean;
  createdAt: Date;
  receiverId: string;
};

function groupMessagesByConversation(messages: MessageModel[]) {
  const conversations: Record<string, MessageModel[]> = {};

  messages.forEach((message) => {
    const participants = [message.senderId, message.receiverId].sort();
    const conversationKey = participants.join("-");

    if (!conversations[conversationKey]) {
      conversations[conversationKey] = [];
    }

    conversations[conversationKey].push(message);
  });

  // Transforma o objeto em um array de objetos com { conversationId, messages }
  const normalized = Object.entries(conversations).map(([conversationId, messages]) => ({
    conversationId,
    messages,
  }));

  return normalized;
}

export const getMessages = async () => {
  const session = await auth();
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ receiverId: session?.user.id }, { senderId: session?.user.id }],
      },
      select: {
        senderId: true,
        receiverId: true,
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
    if (!messages) {
      return { error: "Erro ao enviar mensagem" };
    }

    const conversas = groupMessagesByConversation(messages);

    console.log(conversas);
    return conversas as any;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao enviar mensagem" };
    }

    throw error;
  }
};
