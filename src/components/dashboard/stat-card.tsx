import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: string;
  trendColor?: 'success' | 'destructive' | 'muted';
}

export function StatCard({ title, value, icon: Icon, description, trend, trendColor = 'muted' }: StatCardProps) {

  const trendBadgeClasses = {
    success: 'bg-success/10 text-success border-success/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    muted: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase">{title}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">{value}</div>
            {trend && <Badge variant="outline" className={cn("text-xs", trendBadgeClasses[trendColor])}>{trend}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
