import { getAppointments, getPatients } from "@/lib/actions";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorAppointments } from "@/components/appointments/doctor-appointments";

export default async function AppointmentsPage() {
  const [initialAppointments, initialPatients] = await Promise.all([
    getAppointments(),
    getPatients(),
  ]);

  // In a real app, you'd get the logged-in doctor's ID
  const currentDoctorId = 'doc-001';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mis Citas" />
      <DoctorAppointments
        initialAppointments={initialAppointments}
        initialPatients={initialPatients}
        doctorId={currentDoctorId}
      />
    </div>
  );
}
