import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatDownloads } from '@/lib/npm-api';

interface NPMScoreRadarProps {
  pkg1Name: string;
  pkg2Name: string;
  pkg1Score: any;
  pkg2Score: any;
}

export function NPMScoreRadar({ pkg1Name, pkg2Name, pkg1Score, pkg2Score }: NPMScoreRadarProps) {
  if (!pkg1Score || !pkg2Score) return null;

  const radarData = [
    {
      metric: 'Quality',
      [pkg1Name]: pkg1Score.score.detail.quality * 100,
      [pkg2Name]: pkg2Score.score.detail.quality * 100,
    },
    {
      metric: 'Popularity',
      [pkg1Name]: pkg1Score.score.detail.popularity * 100,
      [pkg2Name]: pkg2Score.score.detail.popularity * 100,
    },
    {
      metric: 'Maintenance',
      [pkg1Name]: pkg1Score.score.detail.maintenance * 100,
      [pkg2Name]: pkg2Score.score.detail.maintenance * 100,
    },
  ];

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-sm font-medium text-foreground mb-4">📊 NPM Score Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Radar
            name={pkg1Name}
            dataKey={pkg1Name}
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Radar
            name={pkg2Name}
            dataKey={pkg2Name}
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ fill: 'transparent' }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Higher values indicate better scores across Quality, Popularity, and Maintenance
      </p>
    </div>
  );
}

interface DownloadsPieProps {
  pkg1Name: string;
  pkg2Name: string;
  pkg1Downloads: number;
  pkg2Downloads: number;
}

export function DownloadsPie({ pkg1Name, pkg2Name, pkg1Downloads, pkg2Downloads }: DownloadsPieProps) {
  const pieData = [
    { name: pkg1Name, value: pkg1Downloads, color: '#3b82f6' },
    { name: pkg2Name, value: pkg2Downloads, color: '#8b5cf6' },
  ];

  const total = pkg1Downloads + pkg2Downloads;
  const pkg1Percent = ((pkg1Downloads / total) * 100).toFixed(1);
  const pkg2Percent = ((pkg2Downloads / total) * 100).toFixed(1);

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-sm font-medium text-foreground mb-4">📥 Weekly Downloads Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ fill: 'transparent' }}
            formatter={(value: number) => formatDownloads(value)}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span className="text-xs font-medium">{pkg1Name}</span>
          </div>
          <div className="text-lg font-bold text-primary">{pkg1Percent}%</div>
          <div className="text-xs text-muted-foreground">{formatDownloads(pkg1Downloads)}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
            <span className="text-xs font-medium">{pkg2Name}</span>
          </div>
          <div className="text-lg font-bold text-purple-500">{pkg2Percent}%</div>
          <div className="text-xs text-muted-foreground">{formatDownloads(pkg2Downloads)}</div>
        </div>
      </div>
    </div>
  );
}

interface BundleSizeChartProps {
  pkg1Name: string;
  pkg2Name: string;
  pkg1Bundle: { size: number; gzip: number };
  pkg2Bundle: { size: number; gzip: number };
}

export function BundleSizeChart({ pkg1Name, pkg2Name, pkg1Bundle, pkg2Bundle }: BundleSizeChartProps) {
  const bundleData = [
    {
      package: pkg1Name,
      'Minified (KB)': Math.round(pkg1Bundle.size / 1024),
      'Gzipped (KB)': Math.round(pkg1Bundle.gzip / 1024),
    },
    {
      package: pkg2Name,
      'Minified (KB)': Math.round(pkg2Bundle.size / 1024),
      'Gzipped (KB)': Math.round(pkg2Bundle.gzip / 1024),
    },
  ];

  const winner = pkg1Bundle.gzip < pkg2Bundle.gzip ? pkg1Name : pkg2Name;
  const diff = Math.abs(pkg1Bundle.gzip - pkg2Bundle.gzip);

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-sm font-medium text-foreground mb-4">📦 Bundle Size Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bundleData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="package"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            label={{
              value: 'Size (KB)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            formatter={(value: number) => `${value} KB`}
          />
          <Legend />
          <Bar dataKey="Minified (KB)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gzipped (KB)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          🏆 Winner: <span className="font-bold">{winner}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(diff / 1024)} KB smaller (gzipped)
        </p>
      </div>
    </div>
  );
}

interface DependencyChartProps {
  pkg1Name: string;
  pkg2Name: string;
  deps1: number;
  deps2: number;
  devDeps1: number;
  devDeps2: number;
  peerDeps1: number;
  peerDeps2: number;
}

export function DependencyChart({
  pkg1Name,
  pkg2Name,
  deps1,
  deps2,
  devDeps1,
  devDeps2,
  peerDeps1,
  peerDeps2,
}: DependencyChartProps) {
  const depData = [
    {
      name: pkg1Name,
      Dependencies: deps1,
      'Dev Dependencies': devDeps1,
      'Peer Dependencies': peerDeps1,
      Total: deps1 + devDeps1 + peerDeps1,
    },
    {
      name: pkg2Name,
      Dependencies: deps2,
      'Dev Dependencies': devDeps2,
      'Peer Dependencies': peerDeps2,
      Total: deps2 + devDeps2 + peerDeps2,
    },
  ];

  const pkg1Total = deps1 + devDeps1 + peerDeps1;
  const pkg2Total = deps2 + devDeps2 + peerDeps2;
  const winner = pkg1Total < pkg2Total ? pkg1Name : pkg2Name;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-sm font-medium text-foreground mb-4">🔗 Dependency Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={depData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            label={{
              value: 'Count',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend />
          <Bar dataKey="Dependencies" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Dev Dependencies" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Peer Dependencies" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{pkg1Name}</p>
            <p className="text-lg font-bold">{pkg1Total} total</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{pkg2Name}</p>
            <p className="text-lg font-bold">{pkg2Total} total</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          🏆 Simpler: <span className="font-semibold">{winner}</span> (fewer dependencies)
        </p>
      </div>
    </div>
  );
}

interface ReleaseFrequencyProps {
  pkg1Name: string;
  pkg2Name: string;
  pkg1Time: Record<string, string>;
  pkg2Time: Record<string, string>;
}

function countRecentReleases(time: Record<string, string>, days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return Object.entries(time).filter(
    ([k, v]) => k !== 'modified' && k !== 'created' && new Date(v).getTime() >= cutoff
  ).length;
}

export function ReleaseFrequencyChart({ pkg1Name, pkg2Name, pkg1Time, pkg2Time }: ReleaseFrequencyProps) {
  const releaseData = [
    {
      period: 'Last 30d',
      [pkg1Name]: countRecentReleases(pkg1Time, 30),
      [pkg2Name]: countRecentReleases(pkg2Time, 30),
    },
    {
      period: 'Last 90d',
      [pkg1Name]: countRecentReleases(pkg1Time, 90),
      [pkg2Name]: countRecentReleases(pkg2Time, 90),
    },
    {
      period: 'Last 180d',
      [pkg1Name]: countRecentReleases(pkg1Time, 180),
      [pkg2Name]: countRecentReleases(pkg2Time, 180),
    },
    {
      period: 'Last 365d',
      [pkg1Name]: countRecentReleases(pkg1Time, 365),
      [pkg2Name]: countRecentReleases(pkg2Time, 365),
    },
  ];

  const pkg1Year = countRecentReleases(pkg1Time, 365);
  const pkg2Year = countRecentReleases(pkg2Time, 365);
  const winner = pkg1Year > pkg2Year ? pkg1Name : pkg2Name;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-sm font-medium text-foreground mb-4">📈 Release Frequency</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={releaseData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            label={{
              value: 'Releases',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={pkg1Name}
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey={pkg2Name}
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          🏆 Most Active: <span className="font-bold">{winner}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {Math.max(pkg1Year, pkg2Year)} releases in the last year
        </p>
      </div>
    </div>
  );
}

interface WinnerCardsProps {
  pkg1Name: string;
  pkg2Name: string;
  pkg1Bundle: { gzip: number } | null;
  pkg2Bundle: { gzip: number } | null;
  pkg1Downloads: number | null;
  pkg2Downloads: number | null;
  pkg1Score: any | null;
  pkg2Score: any | null;
  rel365_1: number;
  rel365_2: number;
}

export function WinnerCards({
  pkg1Name,
  pkg2Name,
  pkg1Bundle,
  pkg2Bundle,
  pkg1Downloads,
  pkg2Downloads,
  pkg1Score,
  pkg2Score,
  rel365_1,
  rel365_2,
}: WinnerCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Size Winner */}
      <div className="glass-card p-4 text-center animate-fade-in-up">
        <div className="text-xs text-muted-foreground mb-2">Size Winner</div>
        <div className="text-lg font-bold text-green-500">
          {pkg1Bundle && pkg2Bundle
            ? pkg1Bundle.gzip < pkg2Bundle.gzip
              ? pkg1Name
              : pkg2Name
            : 'N/A'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {pkg1Bundle && pkg2Bundle
            ? `${Math.round(Math.abs(pkg1Bundle.gzip - pkg2Bundle.gzip) / 1024)} KB smaller`
            : ''}
        </div>
      </div>

      {/* Popularity Winner */}
      <div className="glass-card p-4 text-center animate-fade-in-up animation-delay-100">
        <div className="text-xs text-muted-foreground mb-2">Popularity Winner</div>
        <div className="text-lg font-bold text-blue-500">
          {pkg1Downloads && pkg2Downloads
            ? pkg1Downloads > pkg2Downloads
              ? pkg1Name
              : pkg2Name
            : 'N/A'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {pkg1Downloads && pkg2Downloads
            ? `${formatDownloads(Math.abs(pkg1Downloads - pkg2Downloads))} more`
            : ''}
        </div>
      </div>

      {/* Maintenance Winner */}
      <div className="glass-card p-4 text-center animate-fade-in-up animation-delay-200">
        <div className="text-xs text-muted-foreground mb-2">Maintenance Winner</div>
        <div className="text-lg font-bold text-purple-500">
          {pkg1Score && pkg2Score
            ? pkg1Score.score.detail.maintenance > pkg2Score.score.detail.maintenance
              ? pkg1Name
              : pkg2Name
            : 'N/A'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {pkg1Score && pkg2Score
            ? `${(Math.max(pkg1Score.score.detail.maintenance, pkg2Score.score.detail.maintenance) * 100).toFixed(0)}% score`
            : ''}
        </div>
      </div>

      {/* Activity Winner */}
      <div className="glass-card p-4 text-center animate-fade-in-up animation-delay-300">
        <div className="text-xs text-muted-foreground mb-2">Activity Winner</div>
        <div className="text-lg font-bold text-orange-500">
          {rel365_1 > rel365_2 ? pkg1Name : pkg2Name}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {Math.max(rel365_1, rel365_2)} releases/year
        </div>
      </div>
    </div>
  );
}
