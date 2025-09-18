import { getAppointments, getPatients } from '@/lib/actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, Calendar, Activity } from 'lucide-react';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { PsaChart } from '@/components/dashboard/charts';
import { PageHeader } from '@/components/shared/page-header';

export default async function DashboardPage() {
  const patients = await getPatients();
  const appointments = await getAppointments();

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Patients" 
          value={patients.length} 
          icon={Users}
          description="Number of patients in the system"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value={upcomingAppointments.length} 
          icon={Calendar} 
          description="Appointments scheduled for today and future dates"
        />
        <StatCard 
          title="Avg. PSA Level" 
          value="4.5 ng/mL" 
          icon={Activity} 
          description="Average across all patients"
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PsaChart />
        </div>
        <div className="lg:col-span-2">
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>
      </div>
    </div>
  );
}
