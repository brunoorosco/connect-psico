"use server";
import { prisma } from "@/lib/db";

type Interval = { start: Date; end: Date };

function getFreeIntervals(availability: Interval, appointments: Interval[]): Interval[] {
  let freeIntervals: Interval[] = [];
  let currentStart = availability.start;

  const sortedAppointments = appointments
    .filter(app => app.end > availability.start && app.start < availability.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const appointment of sortedAppointments) {
    if (currentStart < appointment.start) {
      freeIntervals.push({ start: currentStart, end: appointment.start });
    }
    currentStart = appointment.end > currentStart ? appointment.end : currentStart;
  }

  if (currentStart < availability.end) {
    freeIntervals.push({ start: currentStart, end: availability.end });
  }
  console.log(freeIntervals);

  return freeIntervals;
}

export const getProfessionalSchedule = async (userId: string, date: Date) => {
    const dayOfWeek = date.getDay(); // 0=domingo, 1=segunda, etc.
  
    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: { id: true, userId:true },
    });
  
    if (!professional) throw new Error("Profissional não encontrado");
  
    const availabilities = await prisma.availability.findMany({
      where: {
        professionalId: professional.userId,
        dayOfWeek,
        isAvailable: true,
      },
    });
  
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.userId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' }, // Ignorar cancelados se quiser
      },
    });
  
    // Transformar appointments em Interval[]
    const appointmentIntervals = appointments.map(app => {
      const start = app.appointmentDate;
      const end = new Date(start.getTime() + 30 * 60 * 1000); // Ex: 30 minutos de duração fixa
      return { start, end };
    });
  
    // Gerar buracos de horários livres
    const freeIntervals = availabilities.flatMap(av => {
      const start = new Date(date);
      start.setHours(av.startTime.getHours(), av.startTime.getMinutes(), 0, 0);
      const end = new Date(date);
      end.setHours(av.endTime.getHours(), av.endTime.getMinutes(), 0, 0);
  
      return getFreeIntervals({ start, end }, appointmentIntervals);
    });
  console.log(freeIntervals);
    return freeIntervals;
  };
  