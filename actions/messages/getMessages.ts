'use server'

import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const getMessages = async (professionalId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: professionalId,
      }
    })
    return messages
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: 'Erro ao enviar mensagem' }
    }

    throw error
  }
}
