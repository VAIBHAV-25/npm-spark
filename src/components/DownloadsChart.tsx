import { useDownloadsRange } from '@/hooks/usePackages';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDownloads } from '@/lib/npm-api';
import { DownloadsChartSkeleton } from './Skeletons';

interface DownloadsChartProps {
  packageName: string;
  period?: 'last-week' | 'last-month' | 'last-year';
}

export function DownloadsChart({ packageName, period = 'last-month' }: DownloadsChartProps) {
  const { data, isLoading, error } = useDownloadsRange(packageName, period);

  if (isLoading) return <DownloadsChartSkeleton />;
  if (error || !data?.downloads?.length) return null;

  const chartData = data.downloads.map((d) => ({
    date: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    downloads: d.downloads,
  }));

  return (
    <div className="glass-card p-4">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
        Weekly Downloads
      </h4>
      <div className="text-2xl font-bold text-foreground mb-1">
        {formatDownloads(data.downloads.reduce((sum, d) => sum + d.downloads, 0))}
      </div>
      <div className="text-xs text-muted-foreground mb-4">
        {data.start} to {data.end}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [formatDownloads(value), 'Downloads']}
          />
          <Area
            type="monotone"
            dataKey="downloads"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#downloadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
