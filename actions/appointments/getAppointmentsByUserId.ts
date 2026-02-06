"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

interface PaginationParams1 {
  page?: number;
  limit?: number;
  userId: string;
}

export const getAppointmentsByUserId = async ({ userId, page = 1, limit = 10 }: PaginationParams1) => {
  const skip = (page - 1) * limit;
  const session = await auth();
  if (!session) {
    throw new Error("User not found");
  }

  const professionalId = session.user.id;

  // 1. Buscar ID do paciente na tabela `patients`
  const patientRecord = await prisma.pacientes.findFirst({
    where: { patientId: userId }
  });

  const [appointments, total] = await Promise.all([
    await prisma.appointment.findMany({
      where: {
        patientId: userId,
        professionalId: professionalId,
      },
      select: {
        id: true,
        appointmentDate: true,
        status: true,
        patient: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.appointment.count({
      where: {
        patientId: userId,
        professionalId: professionalId,
      },
    }),
  ]);

  // 2. Se temos o pacienteRecord, buscar as notas associadas
  let notesMap: Record<string, any> = {};
  if (patientRecord) {
    const notes = await prisma.notePatient.findMany({
      where: {
        patientId: patientRecord.id,
        professionalId: professionalId,
      }
    });

    // Criar mapa por data (YYYY-MM-DD) para facilitar o merge
    notes.forEach(note => {
      const dateKey = note.createdAt.toISOString().split('T')[0];
      notesMap[dateKey] = note;
    });
  }

  // 3. Merge notes into appointments
  const mergedAppointments = appointments.map(apt => {
    const dateKey = apt.appointmentDate.toISOString().split('T')[0];
    const note = notesMap[dateKey];
    return {
      ...apt,
      notes: note?.notes || null,
      prescription: note?.prescription || null,
      summaryIdMongo: note?.summaryIdMongo || null,
    };
  });

  return {
    data: mergedAppointments,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
};
