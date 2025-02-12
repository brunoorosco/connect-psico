import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Appointment {
  id: string;
  psychologistId: string;
  patientId: string;
  appointmentDate: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: Date;
}

export const appointmentService = {
  // Criar novo agendamento
  async create(appointment: Omit<Appointment, "id" | "createdAt">) {
    return await prisma.appointment.create({
      data: {
        patientId: appointment.patientId,
        appointmentDate: appointment.appointmentDate,
        professionalId: appointment.psychologistId,
      },
    });
  },

  // Buscar agendamentos do paciente
  async getPatientAppointments(patientId: string) {
    return await prisma.appointment.findMany({
      where: { patientId },
      include: { professional: true },
      orderBy: { appointmentDate: "asc" },
    });
  },

  // Buscar agendamentos do psicólogo
  async getPsychologistAppointments(psychologistId: string) {
    return await prisma.appointment.findMany({
      where: { professionalId: psychologistId },
      include: { patient: true },
      orderBy: { appointmentDate: "asc" },
    });
  },

  // Atualizar status do agendamento
  async updateStatus(id: string, status: Appointment["status"]) {
    return await prisma.appointment.update({
      where: { id },
      data: { status },
    });
  },

  // Excluir agendamento
  async delete(id: string) {
    await prisma.appointment.delete({ where: { id } });
    return true;
  },

  // Buscar disponibilidade do psicólogo
  async getAvailability(psychologistId: string) {
    return await prisma.availability.findMany({
      where: { professionalId: psychologistId, isAvailable: true },
    });
  },
};
