"use server"
import { prisma } from "@/lib/db"

type AvailabilityPayload = {
  professionalId: string
  dayOfWeek: number
  startTime: Date
  endTime: Date
}

export const createAvailabilityBulk = async (availabilities: AvailabilityPayload[]) => {
  try {
    // Opcional: validar todos com zod usando .array()
    await prisma.$transaction(async (tx) => {
      for (const item of availabilities) {
        const conflict = await tx.availability.findFirst({
          where: {
            professionalId: item.professionalId,
            dayOfWeek: item.dayOfWeek,
            isAvailable: true,
            OR: [
              {
                startTime: { lt: item.endTime },
                endTime: { gt: item.startTime },
              },
            ],
          },
        })

        if (conflict) {
          console.log(`Conflito detectado em ${item.startTime.toISOString()}`)
          throw new Error(
            `Conflito detectado em ${item.startTime.toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              dateStyle: "short",
              timeStyle: "short",
            })}`
          )
        }

        await tx.availability.create({ data: item })
      }
    })

    return { success: "Disponibilidades cadastradas com sucesso" }
  } catch (error) {
    console.error("Erro ao criar disponibilidades", error)
    return { error: error instanceof Error ? error.message : "Erro ao criar disponibilidades" }
  }
}
