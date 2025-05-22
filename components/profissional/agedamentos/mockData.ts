
import { Appointment } from "@/domain/model/appointment";
import { User } from "@/domain/model/user";
import { addDays } from "date-fns";

// Generate today and nearby dates for sample data
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockPatients: Omit<User, "role" | "isActive" | "isTwoFactorAuthEnabled" | "createdAt" | "updatedAt" | "image">[] = [
  {
    id: "p1",
    name: "Maria Silva",
    telefone: "(11) 98765-4321",
    email: "maria.silva@email.com"
    //medicalRecordId: "MR001"
  },
  {
    id: "p2",
    name: "João Santos",
    telefone: "(11) 91234-5678",
    email: "joao.santos@email.com",
    //medicalRecordId: "MR002"
  },
  {
    id: "p3",
    name: "Ana Oliveira",
    telefone: "(11) 99876-5432",
    email: "ana.oliveira@email.com",
    //medicalRecordId: "MR003"
  },
  {
    id: "p4",
    name: "Carlos Ferreira",
    telefone: "(11) 98888-7777",
    email: "carlos.ferreira@email.com"
  },
  {
    id: "p5",
    name: "Fernanda Costa",
    telefone: "(11) 97777-6666",
    email: "fernanda.costa@email.com",
    //medicalRecordId: "MR004"
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Maria Silva",
    date: formatDate(today),
    startTime: "09:00",
    endTime: "09:30",
    notes: "Consulta de rotina",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "João Santos",
    date: formatDate(today),
    startTime: "10:00",
    endTime: "10:30",
    notes: "Retorno pós-cirurgia",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a3",
    patientId: "p3",
    patientName: "Ana Oliveira",
    date: formatDate(addDays(today, 1)),
    startTime: "14:00",
    endTime: "14:30",
    notes: "Primeira consulta",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a4",
    patientId: "p4",
    patientName: "Carlos Ferreira",
    date: formatDate(addDays(today, 1)),
    startTime: "15:00",
    endTime: "15:30",
    notes: "Exame de sangue",
    isLinkedToMedicalRecord: false
  },
  {
    id: "a5",
    patientId: "p5",
    patientName: "Fernanda Costa",
    date: formatDate(addDays(today, 2)),
    startTime: "11:00",
    endTime: "11:30",
    notes: "Avaliação",
    isLinkedToMedicalRecord: true
  }
];