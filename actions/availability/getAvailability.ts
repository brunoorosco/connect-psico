// src/actions/getAvailability.ts
"use server";
import { prisma } from "@/lib/db";
import { endOfMonth, startOfMonth } from "date-fns";

export interface TimeSlot {
  id: string;
  startTime: string; // formato: "HH:mm"
  endTime: string; // formato: "HH:mm"
}

export interface WeeklySchedule {
  dayOfWeek: number; // 0 (Domingo) a 6 (Sábado)
  timeSlots: TimeSlot[];
}

export interface DayAvailability {
  date: string; // formato: "yyyy-MM-dd"
  timeSlots: TimeSlot[];
}
export async function getDayAvailabilitiesForMonth(
  professionalId: string,
  dateRef: Date // <- mês selecionado
): Promise<DayAvailability[]> {
  const start = startOfMonth(dateRef);
  const end = endOfMonth(dateRef);
  const raw = await prisma.availability.findMany({
    where: {
      professionalId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { startTime: 'asc' },
  });

  const groupedByDate = raw.reduce((acc, item) => {
    const dateKey = item.startTime.toISOString().split('T')[0];

    if (!acc[dateKey]) acc[dateKey] = [];

    const timeSlot: TimeSlot = {
      id: `${item.id}`,
      startTime: item.startTime.toTimeString().slice(0, 5),
      endTime: item.endTime.toTimeString().slice(0, 5),
    };

    acc[dateKey].push(timeSlot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const response =  Object.entries(groupedByDate).map(([date, timeSlots]) => ({
    date,
    timeSlots,
  }));

  return response
}