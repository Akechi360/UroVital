'use client';

import { useEffect } from 'react';
import { usePatientStore } from '@/lib/store/patient-store';
import type { Patient } from '@/lib/types';
import PatientList from './patient-list';

interface PatientListWrapperProps {
  initialPatients: Patient[];
}

export function PatientListWrapper({ initialPatients }: PatientListWrapperProps) {
  const { setPatients, isInitialized } = usePatientStore();

  useEffect(() => {
    // Initialize the store only once or if the initial data changes
    setPatients(initialPatients);
  }, [initialPatients, setPatients]);

  return <PatientList />;
}
