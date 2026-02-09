import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { usePackageDetails, useWeeklyDownloads, useDownloadsRange } from '@/hooks/usePackages';
import { formatDownloads, formatDate, formatBytes, extractGitHubInfo, getGitHubUrl } from '@/lib/npm-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Package, ArrowRight, X, Github, ExternalLink, Check } from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestionsDropdown } from '@/components/SearchSuggestionsDropdown';
import { addRecentSearch } from '@/lib/recent-searches';

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

  const { data: pkg1Data, isLoading: pkg1Loading, error: pkg1Error } = usePackageDetails(pkg1Name, !!pkg1Name);
  const { data: pkg2Data, isLoading: pkg2Loading, error: pkg2Error } = usePackageDetails(pkg2Name, !!pkg2Name);
  
  const { data: pkg1Downloads } = useWeeklyDownloads(pkg1Name, !!pkg1Name);
  const { data: pkg2Downloads } = useWeeklyDownloads(pkg2Name, !!pkg2Name);

  const { data: pkg1Range } = useDownloadsRange(pkg1Name, 'last-month', !!pkg1Name);
  const { data: pkg2Range } = useDownloadsRange(pkg2Name, 'last-month', !!pkg2Name);

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

  // Prepare chart data
  const chartData = pkg1Range?.downloads?.map((d, i) => ({
    date: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [pkg1Name]: d.downloads,
    [pkg2Name]: pkg2Range?.downloads?.[i]?.downloads || 0,
  })) || [];

  const comparisonRows = hasData ? [
    {
      label: 'Weekly Downloads',
      pkg1: formatDownloads(pkg1Downloads?.downloads || 0),
      pkg2: formatDownloads(pkg2Downloads?.downloads || 0),
      winner: (pkg1Downloads?.downloads || 0) > (pkg2Downloads?.downloads || 0) ? 1 : 2,
    },
    {
      label: 'Latest Version',
      pkg1: pkg1Data['dist-tags'].latest,
      pkg2: pkg2Data['dist-tags'].latest,
    },
    {
      label: 'License',
      pkg1: pkg1Data.license || 'N/A',
      pkg2: pkg2Data.license || 'N/A',
    },
    {
      label: 'Dependencies',
      pkg1: Object.keys(pkg1Data.versions[pkg1Data['dist-tags'].latest]?.dependencies || {}).length.toString(),
      pkg2: Object.keys(pkg2Data.versions[pkg2Data['dist-tags'].latest]?.dependencies || {}).length.toString(),
      winner: Object.keys(pkg1Data.versions[pkg1Data['dist-tags'].latest]?.dependencies || {}).length < 
              Object.keys(pkg2Data.versions[pkg2Data['dist-tags'].latest]?.dependencies || {}).length ? 1 : 2,
    },
    {
      label: 'Install Size',
      pkg1: pkg1Data.versions[pkg1Data['dist-tags'].latest]?.dist?.unpackedSize 
        ? formatBytes(pkg1Data.versions[pkg1Data['dist-tags'].latest].dist.unpackedSize)
        : 'N/A',
      pkg2: pkg2Data.versions[pkg2Data['dist-tags'].latest]?.dist?.unpackedSize 
        ? formatBytes(pkg2Data.versions[pkg2Data['dist-tags'].latest].dist.unpackedSize)
        : 'N/A',
    },
    {
      label: 'Last Publish',
      pkg1: formatDate(pkg1Data.time[pkg1Data['dist-tags'].latest]),
      pkg2: formatDate(pkg2Data.time[pkg2Data['dist-tags'].latest]),
    },
    {
      label: 'Maintainers',
      pkg1: pkg1Data.maintainers?.length.toString() || '0',
      pkg2: pkg2Data.maintainers?.length.toString() || '0',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Packages</h1>
          <p className="text-muted-foreground">
            Compare two NPM packages side by side
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-8 relative z-20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
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
                open={pkg1Open}
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
            <div className="flex-1 w-full relative">
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
                open={pkg2Open}
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
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Comparison Results */}
        {hasData && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Package Headers */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="glass-card p-6">
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

            {/* Comparison Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full">
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
            <div className="grid grid-cols-2 gap-4">
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
  );
}
