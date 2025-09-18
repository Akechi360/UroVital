import { getPatientMedicalHistoryAsString } from '@/lib/actions';
import PatientSummaryClient from '@/components/patients/patient-summary-client';

export default async function PatientSummaryPage({ params }: { params: { patientId: string } }) {
    const medicalHistory = await getPatientMedicalHistoryAsString(params.patientId);

    return <PatientSummaryClient medicalHistory={medicalHistory} />;
}
