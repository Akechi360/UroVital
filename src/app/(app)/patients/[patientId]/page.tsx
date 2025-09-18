import { getConsultationsByPatientId } from '@/lib/actions';
import { MedicalHistoryTimeline } from '@/components/history/medical-history-timeline';

export default async function PatientHistoryPage({ params }: { params: { patientId: string } }) {
  const medicalHistory = await getConsultationsByPatientId(params.patientId);

  return (
      <MedicalHistoryTimeline history={medicalHistory} />
  );
}
