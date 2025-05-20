import { Status } from "@prisma/client";
import { ProfessionalModel } from "./professional";
import { User } from "./user";

export type Appointment = {
  id: string;
  patientId: string;
  professionalId: string   
  appointmentDate: Date 
  notes?: string;
  status: Status
  duration: number   
  isLinkedToMedicalRecord: boolean;
  createdAt?: Date
  patient: User
  professional: ProfessionalModel;
};

export type CalendarViewType = 'daily' | 'weekly' | 'monthly';
