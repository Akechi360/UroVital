
'use client'
import { getAppointments, getPatients } from "@/lib/actions";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorAppointments } from "@/components/appointments/doctor-appointments";
import { PatientAppointments } from "@/components/appointments/patient-appointments";
import { useAuth } from "@/components/layout/auth-provider";
import { useEffect, useState } from "react";
import type { Appointment, Patient } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarOff } from "lucide-react";

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const [initialAppointments, setInitialAppointments] = useState<Appointment[]>([]);
  const [initialPatients, setInitialPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      const [appointments, patients] = await Promise.all([
        getAppointments(),
        getPatients(),
      ]);
      setInitialAppointments(appointments);
      setInitialPatients(patients);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !currentUser) {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Mis Citas" />
            <p>Cargando citas...</p>
        </div>
    )
  }

  const { role, patientId: currentPatientId } = currentUser;
  
  const renderContent = () => {
    switch (role) {
      case 'doctor':
      case 'admin':
      case 'secretaria':
        // Admin, Secretaria and Doctor see the global appointment view
        return (
          <DoctorAppointments
            initialAppointments={initialAppointments}
            initialPatients={initialPatients}
            doctorId={'doc-001'} // In a real app, this might differ for a global view
          />
        );
      case 'patient':
        return (
          <PatientAppointments
            initialAppointments={initialAppointments}
            patientId={currentPatientId!}
          />
        );
      default:
        return (
          <Card>
              <CardContent className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                  <CalendarOff className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Sin Citas</h3>
                  <p className="text-muted-foreground">Tu rol actual ({role}) no tiene una vista de citas.</p>
              </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={role === 'patient' ? "Mis Citas" : "Agenda de Citas"} />
      {renderContent()}
    </div>
  );
}

