export const ALL_PERMISSIONS = [
  'admin:all',
  'dashboard:read',
  'appointments:read',
  'appointments:write',
  'patients:read',
  'patients:write',
  'companies:read',
  'companies:write',
  'settings:read',
  'finance:read',
  'finance:write',
] as const;
export type Permission = typeof ALL_PERMISSIONS[number];

export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  admin: [
    'admin:all',
    'dashboard:read',
    'appointments:read',
    'appointments:write',
    'patients:read',
    'patients:write',
    'companies:read',
    'companies:write',
    'settings:read',
    'finance:read',
    'finance:write',
  ],
  doctor: [
    'dashboard:read',
    'appointments:read',
    'patients:read',
    'patients:write',
    'settings:read',
  ],
  secretaria: [
    'dashboard:read',
    'appointments:read',
    'appointments:write',
    'patients:read',
    'companies:read',
    'finance:read', // Can see payments, but not audit
  ],
  patient: [
    'appointments:read',
    'appointments:write',
    'settings:read',
  ],
};


export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  bloodType: string;
  status: 'Activo' | 'Inactivo';
  lastVisit?: string;
  contact: {
    phone: string;
    email: string;
  };
  avatarUrl?: string;
  companyId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
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
    patientId: string;
    title: string;
    date: string;
    type: string;
    notes: string;
    fileUrl: string;
    attachments: string[];
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
  role: 'doctor' | 'patient' | 'admin' | 'secretaria';
  patientId?: string;
}

export interface IpssScore {
  id: string;
  patientId: string;
  date: string;
  score: number;
  category: 'Leve' | 'Moderado' | 'Severo';
}

export interface Company {
  id: string;
  name: string;
  ruc: string;
  phone?: string;
  email?: string;
  status: 'Activo' | 'Inactivo';
}

export type NewReportFormValues = Omit<Report, 'id' | 'patientId' | 'fileUrl'> & { patientId?: string };

export interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  expiryDate: string;
}

export interface Provider {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PaymentType {
  id: string;
  name: string;
  description: string;
  defaultAmount?: number;
}

export interface Payment {
  id: string;
  entityId: string; // patientId or companyId
  entityType: 'patient' | 'company';
  paymentTypeId: string;
  paymentMethodId: string;
  amount: number;
  date: string;
  status: 'Completado' | 'Pendiente' | 'Fallido';
}
