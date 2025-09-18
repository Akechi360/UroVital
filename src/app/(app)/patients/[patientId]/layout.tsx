import { getPatientById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import PatientDetailHeader from '@/components/patients/patient-detail-header';
import PatientDetailNav from '@/components/patients/patient-detail-nav';
import { AddHistoryFab } from '@/components/patients/add-history-fab';

export default async function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { patientId: string };
}) {
  const patient = await getPatientById(params.patientId);

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PatientDetailHeader patient={patient} />
      <PatientDetailNav patientId={patient.id} />
      <div className="-mt-4">{children}</div>
      <AddHistoryFab patient={patient} />
    </div>
  );
}
