import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { usePackageDetails, useWeeklyDownloads, useDownloadsRange, usePackageSearchScore } from '@/hooks/usePackages';
import { formatDownloads, formatDate, formatBytes, extractGitHubInfo, getGitHubUrl } from '@/lib/npm-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Package, ArrowRight, X, Github, ExternalLink, Check } from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestionsDropdown } from '@/components/SearchSuggestionsDropdown';
import { addRecentSearch } from '@/lib/recent-searches';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { ComparisonConclusion } from '@/components/ComparisonConclusion';
import { useBundleSize } from '@/hooks/usePackages';
import {
  NPMScoreRadar,
  DownloadsPie,
  BundleSizeChart,
  DependencyChart,
  ReleaseFrequencyChart,
  WinnerCards,
} from '@/components/ComparisonCharts';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pkg1Param = searchParams.get('pkg1') || '';
  const pkg2Param = searchParams.get('pkg2') || '';

  const [pkg1Input, setPkg1Input] = useState(pkg1Param);
  const [pkg2Input, setPkg2Input] = useState(pkg2Param);
  const [pkg1Name, setPkg1Name] = useState(pkg1Param);
  const [pkg2Name, setPkg2Name] = useState(pkg2Param);
  const pkg1Suggestions = useSearchSuggestions(pkg1Input);
  const pkg2Suggestions = useSearchSuggestions(pkg2Input);
  const [pkg1Open, setPkg1Open] = useState(false);
  const [pkg2Open, setPkg2Open] = useState(false);
  const [pkg1Active, setPkg1Active] = useState(0);
  const [pkg2Active, setPkg2Active] = useState(0);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { data: pkg1Data, isLoading: pkg1Loading, error: pkg1Error } = usePackageDetails(pkg1Name, !!pkg1Name);
  const { data: pkg2Data, isLoading: pkg2Loading, error: pkg2Error } = usePackageDetails(pkg2Name, !!pkg2Name);
  
  const { data: pkg1Downloads } = useWeeklyDownloads(pkg1Name, !!pkg1Name);
  const { data: pkg2Downloads } = useWeeklyDownloads(pkg2Name, !!pkg2Name);

  const { data: pkg1Range } = useDownloadsRange(pkg1Name, 'last-month', !!pkg1Name);
  const { data: pkg2Range } = useDownloadsRange(pkg2Name, 'last-month', !!pkg2Name);
  const { data: pkg1Score } = usePackageSearchScore(pkg1Name, !!pkg1Name);
  const { data: pkg2Score } = usePackageSearchScore(pkg2Name, !!pkg2Name);
  const { data: pkg1Bundle } = useBundleSize(pkg1Name, pkg1Data?.['dist-tags']?.latest, !!pkg1Name);
  const { data: pkg2Bundle } = useBundleSize(pkg2Name, pkg2Data?.['dist-tags']?.latest, !!pkg2Name);

  const handleCompare = () => {
    if (pkg1Input.trim() && pkg2Input.trim()) {
      addRecentSearch(pkg1Input.trim());
      addRecentSearch(pkg2Input.trim());
      setPkg1Name(pkg1Input.trim());
      setPkg2Name(pkg2Input.trim());
      setSearchParams({ pkg1: pkg1Input.trim(), pkg2: pkg2Input.trim() });
      setPkg1Open(false);
      setPkg2Open(false);
    }
  };

  const isLoading = pkg1Loading || pkg2Loading;
  const hasData = pkg1Data && pkg2Data;

  const sumDownloads = (range?: { downloads?: Array<{ downloads: number }> }) =>
    (range?.downloads || []).reduce((sum, d) => sum + d.downloads, 0);

  const trendPercent = (range?: { downloads?: Array<{ downloads: number }> }) => {
    const ds = range?.downloads || [];
    if (ds.length < 14) return null;
    const last7 = ds.slice(-7).reduce((s, d) => s + d.downloads, 0);
    const prev7 = ds.slice(-14, -7).reduce((s, d) => s + d.downloads, 0);
    if (prev7 === 0) return null;
    return (last7 - prev7) / prev7;
  };

  const countRecentReleases = (time: Record<string, string>, days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return Object.entries(time).filter(([k, v]) => k !== "modified" && k !== "created" && new Date(v).getTime() >= cutoff)
      .length;
  };

  // Prepare chart data
  const chartData = pkg1Range?.downloads?.map((d, i) => ({
    date: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [pkg1Name]: d.downloads,
    [pkg2Name]: pkg2Range?.downloads?.[i]?.downloads || 0,
  })) || [];

  const latest1 = hasData ? pkg1Data['dist-tags'].latest : '';
  const latest2 = hasData ? pkg2Data['dist-tags'].latest : '';
  const latestInfo1 = hasData ? pkg1Data.versions[latest1] : undefined;
  const latestInfo2 = hasData ? pkg2Data.versions[latest2] : undefined;

  const monthTotal1 = sumDownloads(pkg1Range);
  const monthTotal2 = sumDownloads(pkg2Range);
  const monthAvg1 = pkg1Range?.downloads?.length ? Math.round(monthTotal1 / pkg1Range.downloads.length) : null;
  const monthAvg2 = pkg2Range?.downloads?.length ? Math.round(monthTotal2 / pkg2Range.downloads.length) : null;
  const t1 = trendPercent(pkg1Range);
  const t2 = trendPercent(pkg2Range);

  const deps1 = Object.keys(latestInfo1?.dependencies || {}).length;
  const deps2 = Object.keys(latestInfo2?.dependencies || {}).length;
  const devDeps1 = Object.keys(latestInfo1?.devDependencies || {}).length;
  const devDeps2 = Object.keys(latestInfo2?.devDependencies || {}).length;
  const peerDeps1 = Object.keys(latestInfo1?.peerDependencies || {}).length;
  const peerDeps2 = Object.keys(latestInfo2?.peerDependencies || {}).length;

  const unpack1 = latestInfo1?.dist?.unpackedSize ?? null;
  const unpack2 = latestInfo2?.dist?.unpackedSize ?? null;
  const fileCount1 = latestInfo1?.dist?.fileCount ?? null;
  const fileCount2 = latestInfo2?.dist?.fileCount ?? null;

  const versionsCount1 = hasData ? Object.keys(pkg1Data.versions).length : 0;
  const versionsCount2 = hasData ? Object.keys(pkg2Data.versions).length : 0;
  const tagsCount1 = hasData ? Object.keys(pkg1Data['dist-tags']).length : 0;
  const tagsCount2 = hasData ? Object.keys(pkg2Data['dist-tags']).length : 0;

  const rel30_1 = hasData ? countRecentReleases(pkg1Data.time, 30) : 0;
  const rel30_2 = hasData ? countRecentReleases(pkg2Data.time, 30) : 0;
  const rel365_1 = hasData ? countRecentReleases(pkg1Data.time, 365) : 0;
  const rel365_2 = hasData ? countRecentReleases(pkg2Data.time, 365) : 0;

  const hasTypes1 = Boolean(latestInfo1?.types || (latestInfo1 as any)?.typings);
  const hasTypes2 = Boolean(latestInfo2?.types || (latestInfo2 as any)?.typings);
  const hasEsm1 = Boolean(latestInfo1?.module || (latestInfo1 as any)?.type === "module");
  const hasEsm2 = Boolean(latestInfo2?.module || (latestInfo2 as any)?.type === "module");
  const nodeEngine1 = latestInfo1?.engines?.node || 'N/A';
  const nodeEngine2 = latestInfo2?.engines?.node || 'N/A';

  const comparisonRows = hasData ? [
    {
      label: 'Weekly Downloads',
      pkg1: formatDownloads(pkg1Downloads?.downloads || 0),
      pkg2: formatDownloads(pkg2Downloads?.downloads || 0),
      winner: (pkg1Downloads?.downloads || 0) > (pkg2Downloads?.downloads || 0) ? 1 : 2,
    },
    {
      label: 'Downloads (Last 30 Days)',
      pkg1: monthTotal1 ? formatDownloads(monthTotal1) : 'N/A',
      pkg2: monthTotal2 ? formatDownloads(monthTotal2) : 'N/A',
      winner: monthTotal1 > monthTotal2 ? 1 : 2,
    },
    {
      label: 'Avg Downloads / Day (30d)',
      pkg1: monthAvg1 !== null ? formatDownloads(monthAvg1) : 'N/A',
      pkg2: monthAvg2 !== null ? formatDownloads(monthAvg2) : 'N/A',
      winner: (monthAvg1 ?? 0) > (monthAvg2 ?? 0) ? 1 : 2,
    },
    {
      label: 'Trend (Last 7d vs Prev 7d)',
      pkg1: t1 === null ? 'N/A' : `${t1 >= 0 ? '+' : ''}${Math.round(t1 * 100)}%`,
      pkg2: t2 === null ? 'N/A' : `${t2 >= 0 ? '+' : ''}${Math.round(t2 * 100)}%`,
    },
    {
      label: 'Latest Version',
      pkg1: latest1,
      pkg2: latest2,
    },
    {
      label: 'Total Versions',
      pkg1: versionsCount1.toLocaleString(),
      pkg2: versionsCount2.toLocaleString(),
    },
    {
      label: 'Dist Tags',
      pkg1: tagsCount1.toString(),
      pkg2: tagsCount2.toString(),
    },
    {
      label: 'License',
      pkg1: pkg1Data.license || 'N/A',
      pkg2: pkg2Data.license || 'N/A',
    },
    {
      label: 'Dependencies',
      pkg1: deps1.toString(),
      pkg2: deps2.toString(),
      winner: deps1 < deps2 ? 1 : 2,
    },
    {
      label: 'Dev Dependencies',
      pkg1: devDeps1.toString(),
      pkg2: devDeps2.toString(),
      winner: devDeps1 < devDeps2 ? 1 : 2,
    },
    {
      label: 'Peer Dependencies',
      pkg1: peerDeps1.toString(),
      pkg2: peerDeps2.toString(),
      winner: peerDeps1 < peerDeps2 ? 1 : 2,
    },
    {
      label: 'Install Size',
      pkg1: unpack1 ? formatBytes(unpack1) : 'N/A',
      pkg2: unpack2 ? formatBytes(unpack2) : 'N/A',
      winner: unpack1 !== null && unpack2 !== null ? (unpack1 < unpack2 ? 1 : 2) : undefined,
    },
    {
      label: 'Bundle Size (Minified)',
      pkg1: pkg1Bundle?.size ? formatBytes(pkg1Bundle.size) : 'N/A',
      pkg2: pkg2Bundle?.size ? formatBytes(pkg2Bundle.size) : 'N/A',
      winner: pkg1Bundle?.size && pkg2Bundle?.size ? (pkg1Bundle.size < pkg2Bundle.size ? 1 : 2) : undefined,
    },
    {
      label: 'Bundle Size (Gzipped)',
      pkg1: pkg1Bundle?.gzip ? formatBytes(pkg1Bundle.gzip) : 'N/A',
      pkg2: pkg2Bundle?.gzip ? formatBytes(pkg2Bundle.gzip) : 'N/A',
      winner: pkg1Bundle?.gzip && pkg2Bundle?.gzip ? (pkg1Bundle.gzip < pkg2Bundle.gzip ? 1 : 2) : undefined,
    },
    {
      label: 'File Count',
      pkg1: fileCount1 !== null ? fileCount1.toString() : 'N/A',
      pkg2: fileCount2 !== null ? fileCount2.toString() : 'N/A',
    },
    {
      label: 'Last Publish',
      pkg1: formatDate(pkg1Data.time[pkg1Data['dist-tags'].latest]),
      pkg2: formatDate(pkg2Data.time[pkg2Data['dist-tags'].latest]),
    },
    {
      label: 'Releases (Last 30 Days)',
      pkg1: rel30_1.toString(),
      pkg2: rel30_2.toString(),
    },
    {
      label: 'Releases (Last 12 Months)',
      pkg1: rel365_1.toString(),
      pkg2: rel365_2.toString(),
    },
    {
      label: 'TypeScript Types',
      pkg1: hasTypes1 ? 'Yes' : 'No',
      pkg2: hasTypes2 ? 'Yes' : 'No',
      winner: hasTypes1 !== hasTypes2 ? (hasTypes1 ? 1 : 2) : undefined,
    },
    {
      label: 'ESM Hint',
      pkg1: hasEsm1 ? 'Yes' : 'No',
      pkg2: hasEsm2 ? 'Yes' : 'No',
      winner: hasEsm1 !== hasEsm2 ? (hasEsm1 ? 1 : 2) : undefined,
    },
    {
      label: 'Node Engine',
      pkg1: nodeEngine1,
      pkg2: nodeEngine2,
    },
    {
      label: 'NPM Score (Final)',
      pkg1: pkg1Score ? (pkg1Score.score.final * 100).toFixed(0) : 'N/A',
      pkg2: pkg2Score ? (pkg2Score.score.final * 100).toFixed(0) : 'N/A',
      winner: (pkg1Score?.score.final ?? 0) > (pkg2Score?.score.final ?? 0) ? 1 : 2,
    },
    {
      label: 'NPM Score (Quality)',
      pkg1: pkg1Score ? (pkg1Score.score.detail.quality * 100).toFixed(0) : 'N/A',
      pkg2: pkg2Score ? (pkg2Score.score.detail.quality * 100).toFixed(0) : 'N/A',
    },
    {
      label: 'NPM Score (Popularity)',
      pkg1: pkg1Score ? (pkg1Score.score.detail.popularity * 100).toFixed(0) : 'N/A',
      pkg2: pkg2Score ? (pkg2Score.score.detail.popularity * 100).toFixed(0) : 'N/A',
    },
    {
      label: 'NPM Score (Maintenance)',
      pkg1: pkg1Score ? (pkg1Score.score.detail.maintenance * 100).toFixed(0) : 'N/A',
      pkg2: pkg2Score ? (pkg2Score.score.detail.maintenance * 100).toFixed(0) : 'N/A',
    },
    {
      label: 'Maintainers',
      pkg1: pkg1Data.maintainers?.length.toString() || '0',
      pkg2: pkg2Data.maintainers?.length.toString() || '0',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarfieldEffect />
      
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="container py-8" style={{ overflow: 'visible' }}>
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">Compare Packages</h1>
            <p className="text-muted-foreground">
              Compare two NPM packages side by side
            </p>
          </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-8 relative z-20 animate-fade-in-up animation-delay-200" style={{ overflow: 'visible' }}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1 w-full relative z-30">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={pkg1Input}
                onChange={(e) => {
                  setPkg1Input(e.target.value);
                  setPkg1Active(0);
                  setPkg1Open(true);
                }}
                onFocus={() => setPkg1Open(true)}
                onBlur={() => window.setTimeout(() => setPkg1Open(false), 120)}
                onKeyDown={(e) => {
                  if (pkg1Open && pkg1Suggestions.items.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setPkg1Active((i) => Math.min(i + 1, pkg1Suggestions.items.length - 1));
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setPkg1Active((i) => Math.max(i - 1, 0));
                      return;
                    }
                    if (e.key === "Enter") {
                      const picked = pkg1Suggestions.items[pkg1Active];
                      if (picked) {
                        e.preventDefault();
                        setPkg1Input(picked.value);
                        setPkg1Open(false);
                        addRecentSearch(picked.value);
                        return;
                      }
                    }
                    if (e.key === "Escape") {
                      setPkg1Open(false);
                      return;
                    }
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCompare();
                  }
                }}
                placeholder="First package (e.g., react)"
                className="pl-10 font-mono bg-secondary"
              />
              <SearchSuggestionsDropdown
                open={pkg1Open && pkg1Input.trim().length > 0}
                items={pkg1Suggestions.items}
                activeIndex={pkg1Active}
                onPick={(value) => {
                  setPkg1Input(value);
                  setPkg1Open(false);
                  addRecentSearch(value);
                }}
              />
            </div>
            <span className="text-muted-foreground font-bold text-xl hidden md:block">vs</span>
            <div className="flex-1 w-full relative z-30">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={pkg2Input}
                onChange={(e) => {
                  setPkg2Input(e.target.value);
                  setPkg2Active(0);
                  setPkg2Open(true);
                }}
                onFocus={() => setPkg2Open(true)}
                onBlur={() => window.setTimeout(() => setPkg2Open(false), 120)}
                onKeyDown={(e) => {
                  if (pkg2Open && pkg2Suggestions.items.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setPkg2Active((i) => Math.min(i + 1, pkg2Suggestions.items.length - 1));
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setPkg2Active((i) => Math.max(i - 1, 0));
                      return;
                    }
                    if (e.key === "Enter") {
                      const picked = pkg2Suggestions.items[pkg2Active];
                      if (picked) {
                        e.preventDefault();
                        setPkg2Input(picked.value);
                        setPkg2Open(false);
                        addRecentSearch(picked.value);
                        return;
                      }
                    }
                    if (e.key === "Escape") {
                      setPkg2Open(false);
                      return;
                    }
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCompare();
                  }
                }}
                placeholder="Second package (e.g., vue)"
                className="pl-10 font-mono bg-secondary"
              />
              <SearchSuggestionsDropdown
                open={pkg2Open && pkg2Input.trim().length > 0}
                items={pkg2Suggestions.items}
                activeIndex={pkg2Active}
                onPick={(value) => {
                  setPkg2Input(value);
                  setPkg2Open(false);
                  addRecentSearch(value);
                }}
              />
            </div>
            <Button onClick={handleCompare} className="gap-2" disabled={!pkg1Input.trim() || !pkg2Input.trim()}>
              Compare
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Errors */}
        {(pkg1Error || pkg2Error) && (
          <div className="glass-card p-6 mb-8 text-center">
            <X className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">
              {pkg1Error && `Package "${pkg1Name}" not found. `}
              {pkg2Error && `Package "${pkg2Name}" not found.`}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading packages...</p>
          </div>
        )}

        {/* Comparison Results */}
        {hasData && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Package Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-200">
              {[pkg1Data, pkg2Data].map((pkg, idx) => {
                const gitHub = extractGitHubInfo(pkg.repository?.url);
                return (
                  <div key={pkg.name} className="glass-card p-6">
                    <h2 className="font-mono text-xl font-bold text-foreground mb-2">
                      {pkg.name}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {pkg.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gitHub && (
                        <a
                          href={getGitHubUrl(gitHub)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Github className="h-3 w-3" />
                          GitHub
                        </a>
                      )}
                      {pkg.homepage && (
                        <a
                          href={pkg.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Homepage
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Downloads Chart */}
            {chartData.length > 0 && (
              <div className="glass-card p-6 animate-fade-in-up animation-delay-400">
                <h3 className="text-sm font-medium text-foreground mb-4">Downloads Trend (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatDownloads(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => formatDownloads(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={pkg1Name}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={pkg2Name}
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Winner Cards */}
            {hasData && (
              <WinnerCards
                pkg1Name={pkg1Name}
                pkg2Name={pkg2Name}
                pkg1Bundle={pkg1Bundle}
                pkg2Bundle={pkg2Bundle}
                pkg1Downloads={pkg1Downloads?.downloads || null}
                pkg2Downloads={pkg2Downloads?.downloads || null}
                pkg1Score={pkg1Score}
                pkg2Score={pkg2Score}
                rel365_1={rel365_1}
                rel365_2={rel365_2}
              />
            )}

            {/* Visual Analytics Grid */}
            {hasData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* NPM Score Radar Chart */}
                {pkg1Score && pkg2Score && (
                  <NPMScoreRadar
                    pkg1Name={pkg1Name}
                    pkg2Name={pkg2Name}
                    pkg1Score={pkg1Score}
                    pkg2Score={pkg2Score}
                  />
                )}

                {/* Downloads Pie Chart */}
                {pkg1Downloads && pkg2Downloads && (
                  <DownloadsPie
                    pkg1Name={pkg1Name}
                    pkg2Name={pkg2Name}
                    pkg1Downloads={pkg1Downloads.downloads}
                    pkg2Downloads={pkg2Downloads.downloads}
                  />
                )}
              </div>
            )}

            {/* Bundle Size Comparison */}
            {pkg1Bundle && pkg2Bundle && (
              <div className="mb-8">
                <BundleSizeChart
                  pkg1Name={pkg1Name}
                  pkg2Name={pkg2Name}
                  pkg1Bundle={pkg1Bundle}
                  pkg2Bundle={pkg2Bundle}
                />
              </div>
            )}

            {/* Dependency and Release Charts */}
            {hasData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Dependency Distribution */}
                <DependencyChart
                  pkg1Name={pkg1Name}
                  pkg2Name={pkg2Name}
                  deps1={deps1}
                  deps2={deps2}
                  devDeps1={devDeps1}
                  devDeps2={devDeps2}
                  peerDeps1={peerDeps1}
                  peerDeps2={peerDeps2}
                />

                {/* Release Frequency */}
                <ReleaseFrequencyChart
                  pkg1Name={pkg1Name}
                  pkg2Name={pkg2Name}
                  pkg1Time={pkg1Data.time}
                  pkg2Time={pkg2Data.time}
                />
              </div>
            )}

            {/* Smart Recommendation */}
            <ComparisonConclusion
              pkg1={pkg1Data}
              pkg2={pkg2Data}
              pkg1Downloads={pkg1Downloads}
              pkg2Downloads={pkg2Downloads}
              pkg1BundleGzip={pkg1Bundle?.gzip}
              pkg2BundleGzip={pkg2Bundle?.gzip}
              pkg1Score={pkg1Score}
              pkg2Score={pkg2Score}
              pkg1Range={pkg1Range}
              pkg2Range={pkg2Range}
            />

            {/* Comparison Table */}
            <div className="glass-card overflow-x-auto animate-fade-in-up animation-delay-600">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground">
                      Metric
                    </th>
                    <th className="text-center px-6 py-4 text-xs uppercase tracking-wider text-primary">
                      {pkg1Name}
                    </th>
                    <th className="text-center px-6 py-4 text-xs uppercase tracking-wider text-chart-4">
                      {pkg2Name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0">
                      <td className="px-6 py-4 text-muted-foreground">{row.label}</td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={row.winner === 1 ? 'text-success flex items-center justify-center gap-1' : 'text-foreground'}>
                          {row.winner === 1 && <Check className="h-4 w-4" />}
                          {row.pkg1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={row.winner === 2 ? 'text-success flex items-center justify-center gap-1' : 'text-foreground'}>
                          {row.winner === 2 && <Check className="h-4 w-4" />}
                          {row.pkg2}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Keywords Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[pkg1Data, pkg2Data].map((pkg) => (
                <div key={pkg.name} className="glass-card p-6">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.keywords?.slice(0, 10).map((kw) => (
                      <span key={kw} className="chip">{kw}</span>
                    )) || <span className="text-muted-foreground text-sm">No keywords</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && !isLoading && !pkg1Error && !pkg2Error && (
          <div className="glass-card p-12 text-center relative z-0">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Enter two packages to compare
            </h3>
            <p className="text-muted-foreground text-sm">
              Try comparing popular packages like "react vs vue" or "lodash vs ramda"
            </p>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
