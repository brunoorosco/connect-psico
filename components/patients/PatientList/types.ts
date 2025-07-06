import { Patient } from "@/types/appointment";

export type TPatientListItem =  Patient;

export interface IPatientList {
  patients: TPatientListItem[];
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: number) => void;
  onAppointmentCreate: (patientId: Patient) => void;
};
