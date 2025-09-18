import { getPatientById, getAppointments, getConsultationsByPatientId, getIpssScoresByPatientId } from '@/lib/actions';
import { notFound } from 'next/navigation';
import PatientSummaryClient from '@/components/patients/patient-summary-client';
import type { Patient, Appointment, Consultation, IpssScore } from '@/lib/types';

export default async function PatientSummaryPage({ params }: { params: { patientId: string } }) {
    const patientId = params.patientId;
    const patientData = getPatientById(patientId);
    const appointmentsData = getAppointments();
    const consultationsData = getConsultationsByPatientId(patientId);
    const ipssData = getIpssScoresByPatientId(patientId);

    const [patient, appointments, consultations, ipssScores] = await Promise.all([
        patientData,
        appointmentsData,
        consultationsData,
        ipssData,
    ]);

    if (!patient) {
        notFound();
    }

    const upcomingAppointments = appointments.filter(a => new Date(a.date) > new Date() && a.patientId === patientId);
    const latestConsultations = consultations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    const latestIpss = ipssScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;

    return (
        <PatientSummaryClient
            patient={patient}
            upcomingAppointments={upcomingAppointments}
            latestConsultations={latestConsultations}
            latestIpss={latestIpss}
        />
    );
}
