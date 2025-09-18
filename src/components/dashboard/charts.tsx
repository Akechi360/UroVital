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
  Pie,
  PieChart,
  Cell,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';

const appointmentsData = [
  { month: 'Ene', appointments: 186 },
  { month: 'Feb', appointments: 305 },
  { month: 'Mar', appointments: 237 },
  { month: 'Abr', appointments: 173 },
  { month: 'May', appointments: 209 },
  { month: 'Jun', appointments: 214 },
];

const appointmentsConfig = {
  appointments: {
    label: 'Citas',
    color: 'hsl(var(--primary))',
  },
};

export function AppointmentsPerMonthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Mes</CardTitle>
        <CardDescription>Volumen de citas en los últimos meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={appointmentsConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={appointmentsData}
              margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 400]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="appointments" fill="var(--color-appointments)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const ageData = [
    { age: '0-10', patients: 5 },
    { age: '11-20', patients: 10 },
    { age: '21-30', patients: 15 },
    { age: '31-40', patients: 25 },
    { age: '41-50', patients: 50 },
    { age: '51-60', patients: 75 },
    { age: '61-70', patients: 60 },
    { age: '71-80', patients: 30 },
    { age: '80+', patients: 12 },
  ];
  
  const ageConfig = {
    patients: {
      label: 'Pacientes',
      color: 'hsl(var(--chart-2))',
    },
  };

export function PatientsByAgeChart() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes por Edad</CardTitle>
          <CardDescription>Distribución de pacientes por rango de edad.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ageConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ageData}
                margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="age"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 80]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="patients"
                  type="monotone"
                  stroke="var(--color-patients)"
                  strokeWidth={2}
                  dot={{
                    fill: 'var(--color-patients)',
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
  
const ipssData = [
    { name: 'Leve', value: 400, color: 'hsl(var(--chart-2))' },
    { name: 'Moderado', value: 300, color: 'hsl(var(--chart-4))' },
    { name: 'Severo', value: 200, color: 'hsl(var(--destructive))' },
]

export function IpssDistributionChart() {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Distribución IPSS</CardTitle>
          <CardDescription>Severidad de síntomas prostáticos en pacientes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ipssData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  
                >
                  {ipssData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={10}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                 />
              </PieChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }
  
