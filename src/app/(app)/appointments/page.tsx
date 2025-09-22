import { getAppointments, getPatients } from "@/lib/actions";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorAppointments } from "@/components/appointments/doctor-appointments";
import { PatientAppointments } from "@/components/appointments/patient-appointments";

// En una aplicación real, el rol y el ID del usuario se obtendrían de la sesión de autenticación.
// Para esta simulación, podemos alternar entre 'doctor' y 'patient'.
const currentUserRole = 'doctor'; // o 'patient'
const currentUserId = currentUserRole === 'doctor' ? 'doc-001' : 'p-001';

export default async function AppointmentsPage() {
  const [initialAppointments, initialPatients] = await Promise.all([
    getAppointments(),
    getPatients(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mis Citas" />
      {currentUserRole === 'doctor' ? (
        <DoctorAppointments
          initialAppointments={initialAppointments}
          initialPatients={initialPatients}
          doctorId={currentUserId}
        />
      ) : (
        <PatientAppointments
          initialAppointments={initialAppointments}
          patientId={currentUserId}
        />
      )}
    </div>
  );
}
