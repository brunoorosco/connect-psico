import { Appointment } from "@/domain/model/appointment"
import { PatientModel } from "@/domain/model/patient"

export interface IPatient {
  patient: PatientModel
}

export interface IPatientHeader {
  patient: PatientModel
  onBack: () => void
  onEdit: () => void
  onSendMessage: () => void
  onSchedule: () => void
}

export interface IPatientDetails {
  patient: PatientModel
  onBack: () => void
  onEdit: () => void
}

export interface IPatientAppointmentsTab {
  appointments: Appointment[]
}
