
import { getPatientMedicalHistoryAsString } from '@/lib/actions';
import ReportGenerationClient from '@/components/patients/report-generation-client';

export default async function PatientReportsPage({ params }: { params: { patientId: string } }) {
    const medicalHistory = await getPatientMedicalHistoryAsString(params.patientId);

    return <ReportGenerationClient medicalHistory={medicalHistory} patientId={params.patientId} />;
}
