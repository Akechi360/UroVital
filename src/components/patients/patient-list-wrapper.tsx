'use client';

import { useEffect } from 'react';
import { usePatientStore } from '@/lib/store/patient-store';
import type { Patient } from '@/lib/types';
import PatientList from './patient-list';

interface PatientListWrapperProps {
  initialPatients: Patient[];
}

export default function PatientListWrapper({ initialPatients }: PatientListWrapperProps) {
  const { setPatients, isInitialized } = usePatientStore();

  useEffect(() => {
    // Initialize the store only once
    if (!isInitialized) {
      setPatients(initialPatients);
    }
  }, [initialPatients, setPatients, isInitialized]);

  return <PatientList />;
}
