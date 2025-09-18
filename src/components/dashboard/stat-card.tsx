'use client';

import type { LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus, Users, Calendar, FlaskConical, Activity, CalendarDays } from 'lucide-react';
import { ElementType } from 'react';

const icons: { [key: string]: ElementType } = {
    Users,
    Calendar,
    CalendarDays,
    FlaskConical,
    Activity,
};

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof icons;
  subtext: string;
  trend: 'up' | 'down' | 'stale';
  index: number;
}

const trendConfig = {
  up: {
    icon: ArrowUpRight,
    color: 'text-success',
  },
  down: {
    icon: ArrowDownRight,
    color: 'text-destructive',
  },
  stale: {
    icon: Minus,
    color: 'text-muted-foreground',
  },
};

export function StatCard({ title, value, iconName, subtext, trend, index }: StatCardProps) {
  const TrendIcon = trendConfig[trend].icon;
  const trendColor = trendConfig[trend].color;
  const Icon = icons[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="transform-gpu"
    >
      <div className="group relative rounded-2xl bg-card p-6 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(58,109,255,0.3),0_0_40px_rgba(186,85,211,0.2)]">
        <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
                <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                {Icon && <Icon className="h-5 w-5 text-primary-foreground" />}
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            <TrendIcon className={cn("h-4 w-4", trendColor)} />
            <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </div>
    </motion.div>
  );
}
