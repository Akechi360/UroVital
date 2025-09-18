import { getPatients } from '@/lib/actions';
import PatientList from '@/components/patients/patient-list';
import { PageHeader } from '@/components/shared/page-header';

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="flex flex-col gap-8">
       <PageHeader title="Patients" />
      <PatientList patients={patients} />
    </div>
  );
}
