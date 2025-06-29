import { Appointment, Patient, Professional, Availability, Status } from "@/types/appointment";
import { addDays } from "date-fns";

// Generate today and nearby dates for sample data
const today = new Date();
const formatDate = (date: Date) => date.toISOString();

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva Santos',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-1111',
    medicalRecordId: 'PR-001',
  },
  {
    id: '2',
    name: 'João Pedro Oliveira',
    email: 'joao.pedro@email.com',
    phone: '(11) 99999-2222',
    medicalRecordId: 'PR-002',
  },
  {
    id: '3',
    name: 'Maria Fernanda Costa',
    email: 'maria.fernanda@email.com',
    phone: '(11) 99999-3333',
    medicalRecordId: 'PR-003',
  },
  {
    id: '4',
    name: 'Carlos Eduardo Lima',
    email: 'carlos.eduardo@email.com',
    phone: '(11) 99999-4444',
    medicalRecordId: 'PR-004',
  },
  {
    id: '5',
    name: 'Beatriz Almeida Rocha',
    email: 'beatriz.almeida@email.com',
    phone: '(11) 99999-5555',
    medicalRecordId: 'PR-005',
  },
];

export const mockProfessionals: Professional[] = [
  {
    id: "prof1",
    name: "Dr. Roberto Lima",
    email: "roberto.lima@clinica.com",
    phone: "(11) 99999-1111"
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    professionalId: "prof1",
    patientId: "p1",
    appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
    status: "CONFIRMED" as Status,
    createdAt: formatDate(today),
    patient: mockPatients[0],
    professional: mockProfessionals[0],
    // Legacy fields for display
    date: today.toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "09:30",
    notes: "Consulta de rotina",
    patientName: "Maria Silva",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a2",
    professionalId: "prof1",
    patientId: "p2",
    appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
    status: "CONFIRMED" as Status,
    createdAt: formatDate(today),
    patient: mockPatients[1],
    professional: mockProfessionals[0],
    // Legacy fields for display
    date: today.toISOString().split('T')[0],
    startTime: "10:00",
    endTime: "10:30",
    notes: "Retorno pós-cirurgia",
    patientName: "João Santos",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a3",
    professionalId: "prof1",
    patientId: "p3",
    appointmentDate: new Date(addDays(today, 1).getFullYear(), addDays(today, 1).getMonth(), addDays(today, 1).getDate(), 14, 0).toISOString(),
    status: "PENDING" as Status,
    createdAt: formatDate(today),
    patient: mockPatients[2],
    professional: mockProfessionals[0],
    // Legacy fields for display
    date: addDays(today, 1).toISOString().split('T')[0],
    startTime: "14:00",
    endTime: "14:30",
    notes: "Primeira consulta",
    patientName: "Ana Oliveira",
    isLinkedToMedicalRecord: true
  },
  {
    id: "a4",
    professionalId: "prof1",
    patientId: "p4",
    appointmentDate: new Date(addDays(today, 1).getFullYear(), addDays(today, 1).getMonth(), addDays(today, 1).getDate(), 15, 0).toISOString(),
    status: "PENDING" as Status,
    createdAt: formatDate(today),
    patient: mockPatients[3],
    professional: mockProfessionals[0],
    // Legacy fields for display
    date: addDays(today, 1).toISOString().split('T')[0],
    startTime: "15:00",
    endTime: "15:30",
    notes: "Exame de sangue",
    patientName: "Carlos Ferreira",
    isLinkedToMedicalRecord: false
  },
  {
    id: "a5",
    professionalId: "prof1",
    patientId: "p5",
    appointmentDate: new Date(addDays(today, 2).getFullYear(), addDays(today, 2).getMonth(), addDays(today, 2).getDate(), 11, 0).toISOString(),
    status: "CONFIRMED" as Status,
    createdAt: formatDate(today),
    patient: mockPatients[4],
    professional: mockProfessionals[0],
    // Legacy fields for display
    date: addDays(today, 2).toISOString().split('T')[0],
    startTime: "11:00",
    endTime: "11:30",
    notes: "Avaliação",
    patientName: "Fernanda Costa",
    isLinkedToMedicalRecord: true
  }
];

export const mockAvailabilities: Availability[] = [
  {
    id: "av1",
    professionalId: "prof1",
    dayOfWeek: 1, // Monday
    startTime: "08:00",
    endTime: "17:00",
    isAvailable: true,
    psychologist: mockProfessionals[0]
  },
  {
    id: "av2",
    professionalId: "prof1",
    dayOfWeek: 2, // Tuesday
    startTime: "08:00",
    endTime: "17:00",
    isAvailable: true,
    psychologist: mockProfessionals[0]
  },
  {
    id: "av3",
    professionalId: "prof1",
    dayOfWeek: 3, // Wednesday
    startTime: "08:00",
    endTime: "17:00",
    isAvailable: true,
    psychologist: mockProfessionals[0]
  },
  {
    id: "av4",
    professionalId: "prof1",
    dayOfWeek: 4, // Thursday
    startTime: "08:00",
    endTime: "17:00",
    isAvailable: true,
    psychologist: mockProfessionals[0]
  },
  {
    id: "av5",
    professionalId: "prof1",
    dayOfWeek: 5, // Friday
    startTime: "08:00",
    endTime: "16:00",
    isAvailable: true,
    psychologist: mockProfessionals[0]
  }
];