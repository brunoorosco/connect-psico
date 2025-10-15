import { PatientModel } from "@/domain/model/patient";

export interface IPatientForm {
  patient?: PatientModel | null;
  onCancel: () => void;
}