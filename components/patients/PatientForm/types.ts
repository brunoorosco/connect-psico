import { Patient } from "@/types/appointment";

export interface IPatientForm {
  patient?: Patient | null;
  onCancel: () => void;
}