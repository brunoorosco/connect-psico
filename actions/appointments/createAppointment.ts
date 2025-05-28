"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const CreateAppointmentSchema = z.object({
  professionalId: z.string(),
  patientId: z.string(),
  appointmentDate: z.coerce.date(),
});

export const createAppointment = async (data: z.infer<typeof CreateAppointmentSchema>) => {
  const valid = await CreateAppointmentSchema.safeParseAsync(data);
  if (!valid.success) {
    return { error: "Dados inválidos" };
  }

  const { professionalId, patientId, appointmentDate } = valid.data;

  try {
    // 1. Verificar disponibilidade do profissional no dia/hora
    const dayOfWeek = appointmentDate.getDay();
    const availability = await prisma.availability.findFirst({
      where: {
        professionalId,
        // dayOfWeek,
        isAvailable: true,
        startTime: { lte: appointmentDate },
        endTime: { gte: appointmentDate },
      },
    });

    if (!availability) {
      return { error: "Profissional não disponível neste horário" };
    }

    // 2. Verificar se já existe agendamento neste horário
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId,
        appointmentDate,
      },
    });

    if (existingAppointment) {
      return { error: "Já existe um agendamento neste horário" };
    }
    // 3. Criar agendamento
    const appointment = await prisma.appointment.create({
      data: { professionalId, patientId, appointmentDate },
    });

    return { success: "Agendamento realizado com sucesso", data: appointment };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao criar agendamento" };
    }

    throw error;
  }
};
