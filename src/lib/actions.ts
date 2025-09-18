'use server';

import patientsData from './data/patients.json';
import appointmentsData from './data/appointments.json';
import consultationsData from './data/consultations.json';
import usersData from './data/users.json';
import labResultsData from './data/lab-results.json';
import type { Patient, Appointment, Consultation, User, LabResult } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getPatients(): Promise<Patient[]> {
  await delay(100);
  return patientsData as Patient[];
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  await delay(100);
  return (patientsData as Patient[]).find(p => p.id === id);
}

export async function getAppointments(): Promise<Appointment[]> {
  await delay(100);
  return appointmentsData as Appointment[];
}

export async function getConsultationsByPatientId(patientId: string): Promise<Consultation[]> {
  await delay(100);
  return (consultationsData as Consultation[]).filter(c => c.patientId === patientId);
}

export async function getLabResultsByPatientId(patientId: string): Promise<LabResult[]> {
    await delay(100);
    return (labResultsData as LabResult[]).filter(r => r.patientId === patientId);
}

export async function getPatientMedicalHistoryAsString(patientId: string): Promise<string> {
    await delay(100);
    const consultations = (consultationsData as Consultation[]).filter(c => c.patientId === patientId);

    if (consultations.length === 0) {
        return "No medical history found for this patient.";
    }

    const historyString = consultations
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(c => {
            let entry = `Date: ${new Date(c.date).toLocaleDateString()}\nType: ${c.type}\nDoctor: ${c.doctor}\nNotes: ${c.notes}`;
            if (c.prescriptions && c.prescriptions.length > 0) {
                entry += `\nPrescriptions: ${c.prescriptions.map(p => p.medication).join(', ')}`;
            }
            if (c.labResults && c.labResults.length > 0) {
                entry += `\nLab Results: ${c.labResults.map(l => `${l.testName}: ${l.value ? l.value : 'N/A'}`).join(', ')}`;
            }
            if(c.reports && c.reports.length > 0) {
                entry += `\nReports: ${c.reports.map(r => r.title).join(', ')}`;
            }
            return entry;
        })
        .join('\n\n---\n\n');

    return historyString;
}


// --- Mock Auth Actions ---

const loginSchema = {
  email: 'doctor@uroflow.com',
  password: 'password123',
};

export async function login(credentials: { email: string, password?: string }): Promise<{success: boolean, user?: User, error?: string}> {
  await delay(500);
  if (credentials.email === loginSchema.email && credentials.password === loginSchema.password) {
    const user = (usersData as User[]).find(u => u.email === credentials.email);
    if (user) {
        return { success: true, user: user };
    }
  }
  return { success: false, error: 'Invalid email or password.' };
}
