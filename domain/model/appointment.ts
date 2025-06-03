import { Status } from "@prisma/client";

export type AppointmentModel = {
  id: string;
  patientId: string;
  professionalId: string;
  appointmentDate: Date;
  notes?: string;
  status: Status;
  duration?: number;
  isLinkedToMedicalRecord?: boolean;
  createdAt?: Date;
  patient: { id: string; name: string; telefone: string; email: string };
  professional: { id: string; name: string; telefone: string; email: string };
};

export type CalendarViewType = "daily" | "weekly" | "monthly";
