import { Appointment, Patient } from "@/types/appointment";

export interface IPatient {
  patient: Patient;
}

export interface IPatientHeader {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
  onSendMessage: () => void;
  onSchedule: () => void;
}

export interface IPatientDetails {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
}

export interface IPatientAppointmentsTab {
  appointments: Appointment[];
}