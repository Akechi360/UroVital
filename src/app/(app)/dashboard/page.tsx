import { getAppointments, getPatients } from '@/lib/actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, Calendar, FlaskConical, Activity } from 'lucide-react';
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

  const statCards = [
    {
      title: "Total Pacientes",
      value: patients.length,
      icon: Users,
      subtext: "+2 este mes",
      trend: "up"
    },
    {
      title: "Citas de Hoy",
      value: appointmentsToday.length,
      icon: Calendar,
      subtext: "-1 vs ayer",
      trend: "down"
    },
    {
      title: "Resultados Pendientes",
      value: 1,
      icon: FlaskConical,
      subtext: "Análisis requerido",
      trend: "stale"
    },
    {
        title: "Próximos Estudios",
        value: 4,
        icon: Activity,
        subtext: "Esta semana",
        trend: "up"
      }
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Panel" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card, index) => (
            <StatCard 
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                subtext={card.subtext}
                trend={card.trend as "up" | "down" | "stale"}
                index={index}
            />
        ))}
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
