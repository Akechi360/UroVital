export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Masculino' | 'Femenino';
  bloodType: string;
  status: 'Activo' | 'Inactivo';
  avatarUrl?: string;
  lastVisit?: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  status: 'Programada' | 'Completada' | 'Cancelada';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  duration: string;
}

export interface LabResult {
  id: string;
  patientId?: string;
  testName: string;
  value: string;
  referenceRange?: string;
  date: string;
}

export interface Report {
    id: string;
    title: string;
    date: string;
    fileUrl: string;
}

export interface Consultation {
    id: string;
    patientId: string;
    date: string;
    doctor: string;
    type: 'Inicial' | 'Seguimiento' | 'Pre-operatorio' | 'Post-operatorio';
    notes: string;
    prescriptions: Prescription[];
    labResults: LabResult[];
    reports: Report[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface IpssScore {
  id: string;
  patientId: string;
  date: string;
  score: number;
  category: 'Leve' | 'Moderado' | 'Severo';
}
