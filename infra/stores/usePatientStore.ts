import { Patient } from '@/types/appointment';
import { create } from 'zustand';

type PatientStore = {
  patient: Patient | null;
  setPatient: (data: Patient) => void;
  clearPatient: () => void;
};

export const usePatientStore = create<PatientStore>((set) => ({
  patient: null,
  setPatient: (data) => set({ patient: data }),
  clearPatient: () => set({ patient: null }),
}));
