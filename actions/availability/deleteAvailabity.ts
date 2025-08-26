"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { auth } from "@/auth"
import { addDays } from "date-fns"

const DeleteAvailabilitySchema = z.string({})

function makeUtcFromLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
}

export const deleteAvailabilityByDate = async (dateStr: z.infer<typeof DeleteAvailabilitySchema>) => {
  const valid = await DeleteAvailabilitySchema.safeParseAsync(dateStr)
  const session = await auth()
  if (!valid.success) return { error: "Dados inválidos" }

  const start = makeUtcFromLocalDate(valid.data)
  const end = addDays(start, 1)

  try {
    const deleted = await prisma.availability.deleteMany({
      where: {
        professionalId: session?.user.id as string,
        startTime: {
          gte: start,
          lte: end,
        },
      },
    })
    return { success: "Disponibilidade excluída com sucesso", data: deleted }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return { error: "Erro ao excluir disponibilidade" }
    throw error
  }
}
