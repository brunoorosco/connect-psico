import { PatientModel } from "@/domain/model/patient"

export type TPatientListItem = PatientModel & { email: string }

export interface IPatientList {
  patients: TPatientListItem[]
  onViewPatient: (patient: PatientModel) => void
  onEditPatient: (patient: PatientModel) => void
  onDeletePatient: (patientId: number) => void
  onAppointmentCreate: (patientId: PatientModel) => void
}
