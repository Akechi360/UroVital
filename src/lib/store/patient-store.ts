import { create } from 'zustand';
import type { Patient } from '@/lib/types';

interface PatientState {
  patients: Patient[];
  isInitialized: boolean;
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  isInitialized: false,
  setPatients: (patients) => set({ patients, isInitialized: true }),
  addPatient: (patient) => set((state) => ({
    patients: [patient, ...state.patients]
  })),
}));
