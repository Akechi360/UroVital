'use server';

import patientsData from './data/patients.json';
import appointmentsData from './data/appointments.json';
import consultationsData from './data/consultations.json';
import usersData from './data/users.json';
import labResultsData from './data/lab-results.json';
import ipssScoresData from './data/ipss-values.json';
import reportsData from './data/reports.json';
import type { Patient, Appointment, Consultation, User, LabResult, IpssScore, Report } from './types';

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

export async function getIpssScoresByPatientId(patientId: string): Promise<IpssScore[]> {
    await delay(100);
    return (ipssScoresData as IpssScore[]).filter(r => r.patientId === patientId);
}

export async function getReportsByPatientId(patientId: string): Promise<Report[]> {
    await delay(100);
    return (reportsData as Report[]).filter(r => r.patientId === patientId);
}

export async function getPatientMedicalHistoryAsString(patientId: string): Promise<string> {
    await delay(100);
    const patient = await getPatientById(patientId);
    if (!patient) return "Paciente no encontrado.";

    const consultations = (consultationsData as Consultation[]).filter(c => c.patientId === patientId);

    let fullHistory = `Historial Médico de: ${patient.name}\n`;
    fullHistory += `ID de Paciente: ${patient.id}\n`;
    fullHistory += `Edad: ${patient.age}\n`;
    fullHistory += `Sexo: ${patient.gender}\n`;
    fullHistory += `---------------------------------------\n\n`;

    if (consultations.length === 0) {
        return fullHistory + "No se encontró historial de consultas para este paciente.";
    }

    const historyString = consultations
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(c => {
            let entry = `Fecha: ${new Date(c.date).toLocaleDateString()}\nTipo: ${c.type}\nDoctor: ${c.doctor}\n\nNotas:\n${c.notes}`;
            if (c.prescriptions && c.prescriptions.length > 0) {
                entry += `\n\nRecetas:\n${c.prescriptions.map(p => `- ${p.medication} (${p.dosage}, ${p.duration})`).join('\n')}`;
            }
            if (c.reports && c.reports.length > 0) {
                entry += `\n\nInformes Adjuntos:\n${c.reports.map(r => `- ${r.title}`).join('\n')}`;
            }
            return entry;
        })
        .join('\n\n---\n\n');
    
    return fullHistory + historyString;
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
  return { success: false, error: 'Email o contraseña inválidos.' };
}
