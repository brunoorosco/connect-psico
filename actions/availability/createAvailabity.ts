"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const CreateAvailabilitySchema = z.object({
  professionalId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export const createAvailability = async (data: z.infer<typeof CreateAvailabilitySchema>) => {
  console.log(data)
  const valid = await CreateAvailabilitySchema.safeParseAsync(data);

  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { professionalId, dayOfWeek, startTime, endTime } = valid.data;

  if (startTime >= endTime) {
    return { error: "Hora de início deve ser antes da hora de término" };
  }

  try {
    // Verificar sobreposição com outras disponibilidades
    const overlapping = await prisma.availability.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isAvailable: true,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlapping) {
      return { error: "Já existe uma disponibilidade que conflita com este horário" };
    }

    // Criar disponibilidade
    const availability = await prisma.availability.create({
      data: { professionalId, dayOfWeek, startTime, endTime },
    });

    return { success: "Disponibilidade cadastrada com sucesso", data: availability };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar disponibilidade" };
    }

    throw error;
  }
};
