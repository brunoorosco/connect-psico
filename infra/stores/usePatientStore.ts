import { PatientModel } from '@/domain/model/patient';
import { create } from 'zustand';

type PatientStore = {
  patient: PatientModel | null;
  setPatient: (data: PatientModel) => void;
  clearPatient: () => void;
};

export const usePatientStore = create<PatientStore>((set) => ({
  patient: null,
  setPatient: (data) => set({ patient: data }),
  clearPatient: () => set({ patient: null }),
}));
