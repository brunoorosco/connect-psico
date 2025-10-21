"use server"
import { prisma } from "@/lib/db"

type AvailabilityPayload = {
  professionalId: string
  dayOfWeek: number
  startTime: Date
  endTime: Date
}

function getFutureDates(data: any[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // zera horas para comparar apenas o dia

  return data.filter((item) => {
    const startDate = new Date(item.startTime)
    return startDate >= today
  })
}

export const createAvailabilityBulk = async (availabilities: AvailabilityPayload[]) => {
  const futureSchedules = getFutureDates(availabilities)
  try {
    // Opcional: validar todos com zod usando .array()
    await prisma.$transaction(async (tx) => {
      for (const item of futureSchedules) {
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
  } catch (error: unknown) {
    console.error("Erro ao criar disponibilidades")

    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: "Erro ao criar disponibilidades" }
  }
}
