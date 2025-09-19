import { getPatients } from '@/lib/actions';
import { PatientListWrapper } from '@/components/patients/patient-list-wrapper';
import { PageHeader } from '@/components/shared/page-header';

export default async function PatientsPage() {
  const initialPatients = await getPatients();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pacientes" />
      <PatientListWrapper initialPatients={initialPatients} />
    </div>
  );
}
