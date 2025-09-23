'use client';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  AppointmentsLineChart,
  LabResultsBarChart,
} from '@/components/dashboard/charts';
import { PageHeader } from '@/components/shared/page-header';
import { useAuth } from '@/components/layout/auth-provider';
import { getIpssScoresByPatientId, getPatients, getAppointments } from '@/lib/actions';
import { useEffect, useState } from 'react';
import type { Patient, Appointment, IpssScore } from '@/lib/types';
import { isToday } from 'date-fns';

type DashboardStats = {
    totalPatients: number;
    todayAppointments: number;
    pendingResults: number;
    latestIpssScore: number | 'N/A';
};

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!currentUser) return;
            
            let totalPatients = 0;
            let todayAppointments = 0;
            let pendingResults = 0; // Mocked for now
            let latestIpssScore: number | 'N/A' = 'N/A';

            if (currentUser.role === 'admin' || currentUser.role === 'secretaria' || currentUser.role === 'doctor') {
                const [patients, appointments] = await Promise.all([getPatients(), getAppointments()]);
                totalPatients = patients.length;
                todayAppointments = appointments.filter(a => isToday(new Date(a.date))).length;
                pendingResults = 1; // Static value as per original component
            }

            if (currentUser.role === 'patient' && currentUser.patientId) {
                const ipssScores = await getIpssScoresByPatientId(currentUser.patientId);
                const latestIpss = ipssScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                if (latestIpss) {
                    latestIpssScore = latestIpss.score;
                }
            }
            
            setStats({ totalPatients, todayAppointments, pendingResults, latestIpssScore });
        }
        fetchData();
    }, [currentUser]);

    if (!stats) {
        // You can add a skeleton loader here
        return <div>Cargando panel...</div>
    }

    const patientStatCards = [
        {
            title: "Próxima Cita",
            value: 0,
            iconName: "CalendarDays",
            subtext: "No hay citas programadas",
            trend: "stale"
        },
        {
            title: "Último Puntaje IPSS",
            value: stats.latestIpssScore,
            iconName: "Activity",
            subtext: stats.latestIpssScore !== 'N/A' ? (stats.latestIpssScore <= 7 ? 'Síntomas Leves' : stats.latestIpssScore <= 19 ? 'Síntomas Moderados' : 'Síntomas Severos') : 'Sin registro',
            trend: "stale"
        },
        {
            title: "Resultados Pendientes",
            value: 0,
            iconName: "FlaskConical",
            subtext: "No hay resultados pendientes",
            trend: "stale"
        }
    ];

    const adminDoctorStatCards = [
        {
            title: "Total Pacientes",
            value: stats.totalPatients,
            iconName: "Users",
            subtext: "+2 este mes",
            trend: "up"
        },
        {
            title: "Citas de Hoy",
            value: stats.todayAppointments,
            iconName: "CalendarDays",
            subtext: "-1 vs ayer",
            trend: "down"
        },
        {
            title: "Resultados Pendientes",
            value: stats.pendingResults,
            iconName: "FlaskConical",
            subtext: "Análisis requerido",
            trend: "stale"
        }
    ];

    const statCards = currentUser?.role === 'patient' ? patientStatCards : adminDoctorStatCards;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Panel" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card, index) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        iconName={card.iconName as any}
                        subtext={card.subtext}
                        trend={card.trend as "up" | "down" | "stale"}
                        index={index}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppointmentsLineChart />
                <LabResultsBarChart />
            </div>
        </div>
    );
}
