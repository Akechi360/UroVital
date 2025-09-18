import { getAppointments, getPatients } from '@/lib/actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, Calendar, FlaskConical, Beaker } from 'lucide-react';
import {
  AppointmentsPerMonthChart,
  PatientsByAgeChart,
  IpssDistributionChart,
} from '@/components/dashboard/charts';
import { PageHeader } from '@/components/shared/page-header';

export default async function DashboardPage() {
  const patients = await getPatients();
  const appointments = await getAppointments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentsToday = appointments.filter(a => {
    const apptDate = new Date(a.date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate.getTime() === today.getTime();
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Panel" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pacientes Totales"
          value={patients.length}
          icon={Users}
          description="Número total de pacientes registrados"
          trend="+2 este mes"
          trendColor="success"
        />
        <StatCard
          title="Citas para Hoy"
          value={appointmentsToday.length}
          icon={Calendar}
          description="Citas programadas para el día de hoy"
          trend="-1 vs ayer"
          trendColor="destructive"
        />
        <StatCard
          title="Resultados Pendientes"
          value={1}
          icon={Beaker}
          description="Resultados de laboratorio esperando análisis"
          trend="Estable"
          trendColor="muted"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AppointmentsPerMonthChart />
        </div>
        <div className="lg:col-span-2">
          <PatientsByAgeChart />
        </div>
        <div className="lg:col-span-1">
          <IpssDistributionChart />
        </div>
      </div>
    </div>
  );
}
