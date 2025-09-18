'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { subDays, format } from 'date-fns';


const appointmentsData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'MMM dd'),
      day: format(date, 'eee'),
      appointments: Math.floor(Math.random() * 5) + 2,
    };
});
  
const appointmentsConfig = {
    appointments: {
        label: 'Citas',
        color: 'hsl(var(--primary))',
    },
};

export function AppointmentsLastWeekChart() {
    return (
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all">
        <CardHeader className="p-6">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Evolución de Citas (Últimos 7 Días)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ChartContainer config={appointmentsConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={appointmentsData}
                margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--foreground), 0.2)" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3'}}
                  content={
                    <ChartTooltipContent 
                        className="bg-card/80 backdrop-blur-sm border-border/50"
                    />
                }
                />
                <Line
                  dataKey="appointments"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: 'hsl(var(--background))',
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: 'hsl(var(--background))',
                    stroke: 'hsl(var(--primary))',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
}

const labResultsData = [
    { name: 'Completados', value: 45, color: 'hsl(var(--success))' },
    { name: 'Pendientes', value: 8, color: 'hsl(var(--destructive))' },
];

const labResultsConfig = {
    value: {
      label: 'Resultados',
    },
    Completados: {
        label: 'Completados',
        color: 'hsl(var(--success))',
    },
    Pendientes: {
        label: 'Pendientes',
        color: 'hsl(var(--destructive))',
    },
};

export function LabResultsSummaryChart() {
    return (
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all">
            <CardHeader className="p-6">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Resumen de Resultados de Laboratorio</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <ChartContainer config={labResultsConfig} className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            layout="vertical" 
                            data={labResultsData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
                        >
                             <CartesianGrid horizontal={false} stroke="hsla(var(--foreground), 0.2)" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14 }}
                            />
                            <XAxis dataKey="value" type="number" hide />
                            <ChartTooltip
                                cursor={{fill: 'hsla(var(--foreground), 0.1)'}}
                                content={
                                    <ChartTooltipContent 
                                        className="bg-card/80 backdrop-blur-sm border-border/50"
                                        indicator="dot"
                                    />
                                }
                            />
                            <Bar dataKey="value" radius={8}>
                                {labResultsData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}