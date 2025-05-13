'use server'

import { prisma } from '@/lib/db'
import { z } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const CreateMessageSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1).max(500),
})

export const createMessage = async (data: z.infer<typeof CreateMessageSchema>) => {
  const valid = await CreateMessageSchema.safeParseAsync(data)

  if (!valid.success) {
    return { error: 'Dados inválidos' }
  }

  try {
    const message = await prisma.message.create({
      data: valid.data,
    })
    return { success: 'Mensagem enviada com sucesso', data: message }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: 'Erro ao enviar mensagem' }
    }

    throw error
  }
}
