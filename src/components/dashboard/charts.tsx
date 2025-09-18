'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const chartData = [
  { month: 'January', psa: 1.2 },
  { month: 'February', psa: 1.5 },
  { month: 'March', psa: 1.4 },
  { month: 'April', psa: 2.1 },
  { month: 'May', psa: 2.5 },
  { month: 'June', psa: 2.3 },
];

const chartConfig = {
    psa: {
      label: 'PSA Level (ng/mL)',
      color: 'hsl(var(--primary))',
    },
};

export function PsaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PSA Level Trend</CardTitle>
        <CardDescription>Average PSA levels over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 5]}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="psa" fill="var(--color-psa)" radius={8} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
