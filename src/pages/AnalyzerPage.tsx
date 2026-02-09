import { useState } from 'react';
import { Header } from '@/components/Header';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import {
  Upload,
  FileJson,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Scale,
  Package,
  ExternalLink,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDownloads } from '@/lib/npm-api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  generateAIRecommendations,
  generateProjectHealthScore,
  generateOptimizationSuggestions,
  AIRecommendation,
} from '@/lib/ai-analyzer';
import { AIRecommendations } from '@/components/AIRecommendations';
import { ProjectHealthScore } from '@/components/ProjectHealthScore';
import { OptimizationSuggestions } from '@/components/OptimizationSuggestions';

interface PackageAnalysis {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
  hasVulnerabilities: boolean;
  weeklyDownloads: number;
  license: string;
  status: 'healthy' | 'outdated' | 'vulnerable' | 'deprecated';
  lastPublished?: string;
  hasTypes?: boolean;
  dependencyCount?: number;
}

async function analyzePackageJson(content: string): Promise<{
  dependencies: PackageAnalysis[];
  devDependencies: PackageAnalysis[];
  summary: {
    total: number;
    outdated: number;
    vulnerable: number;
    healthy: number;
  };
  licenseDistribution: Record<string, number>;
  totalDownloads: number;
  avgDownloads: number;
  typeScriptSupport: { withTypes: number; withoutTypes: number };
  projectInfo: {
    name: string;
    version: string;
    description?: string;
  };
  aiRecommendations: AIRecommendation[];
  healthScore: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: Array<{ name: string; impact: number; description: string }>;
  };
  optimizationSuggestions: string[];
}> {
  const parsed = JSON.parse(content);
  const deps = parsed.dependencies || {};
  const devDeps = parsed.devDependencies || {};

  const analyzeDep = async (name: string, version: string): Promise<PackageAnalysis> => {
    try {
      const response = await fetch(`https://registry.npmjs.org/${name}`);
      const data = await response.json();
      const latestVersion = data['dist-tags'].latest;
      const currentClean = version.replace(/^[\^~>=<]/, '');
      const versionData = data.versions[latestVersion];
      
      // Get downloads
      const downloadsRes = await fetch(
        `https://api.npmjs.org/downloads/point/last-week/${name}`
      );
      const downloadsData = await downloadsRes.json();

      // Check for TypeScript support
      const hasTypes = !!(versionData?.types || versionData?.typings);

      // Count dependencies
      const dependencyCount = Object.keys(versionData?.dependencies || {}).length;

      // Simple vulnerability check (in production, use proper API)
      const hasVulnerabilities = false; // Placeholder

      let status: PackageAnalysis['status'] = 'healthy';
      if (hasVulnerabilities) status = 'vulnerable';
      else if (currentClean !== latestVersion) status = 'outdated';
      else status = 'healthy';

      return {
        name,
        currentVersion: currentClean,
        latestVersion,
        isOutdated: currentClean !== latestVersion,
        hasVulnerabilities,
        weeklyDownloads: downloadsData.downloads || 0,
        license: typeof data.license === 'string' ? data.license : data.license?.type || 'Unknown',
        status,
        lastPublished: data.time?.[latestVersion],
        hasTypes,
        dependencyCount,
      };
    } catch (error) {
      return {
        name,
        currentVersion: version,
        latestVersion: version,
        isOutdated: false,
        hasVulnerabilities: false,
        weeklyDownloads: 0,
        license: 'Unknown',
        status: 'healthy',
        hasTypes: false,
        dependencyCount: 0,
      };
    }
  };

  const depPromises = Object.entries(deps).map(([name, version]) =>
    analyzeDep(name, version as string)
  );
  const devDepPromises = Object.entries(devDeps).map(([name, version]) =>
    analyzeDep(name, version as string)
  );

  const [dependencies, devDependencies] = await Promise.all([
    Promise.all(depPromises),
    Promise.all(devDepPromises),
  ]);

  const allDeps = [...dependencies, ...devDependencies];
  
  // Calculate summary statistics
  const summary = {
    total: allDeps.length,
    outdated: allDeps.filter(d => d.isOutdated).length,
    vulnerable: allDeps.filter(d => d.hasVulnerabilities).length,
    healthy: allDeps.filter(d => d.status === 'healthy').length,
  };

  // Calculate license distribution
  const licenseDistribution: Record<string, number> = {};
  allDeps.forEach(dep => {
    const license = dep.license || 'Unknown';
    licenseDistribution[license] = (licenseDistribution[license] || 0) + 1;
  });

  // Calculate download statistics
  const totalDownloads = allDeps.reduce((sum, dep) => sum + dep.weeklyDownloads, 0);
  const avgDownloads = allDeps.length > 0 ? Math.round(totalDownloads / allDeps.length) : 0;

  // Calculate TypeScript support
  const typeScriptSupport = {
    withTypes: allDeps.filter(d => d.hasTypes).length,
    withoutTypes: allDeps.filter(d => !d.hasTypes).length,
  };

  // Extract project info
  const projectInfo = {
    name: parsed.name || 'Unnamed Project',
    version: parsed.version || '1.0.0',
    description: parsed.description,
  };

  // Generate AI recommendations
  const aiRecommendations = await generateAIRecommendations(allDeps);

  // Calculate health score
  const healthScore = generateProjectHealthScore(allDeps);

  // Generate optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(allDeps);

  return {
    dependencies,
    devDependencies,
    summary,
    licenseDistribution,
    totalDownloads,
    avgDownloads,
    typeScriptSupport,
    projectInfo,
    aiRecommendations,
    healthScore,
    optimizationSuggestions,
  };
}

export default function AnalyzerPage() {
  const [packageJson, setPackageJson] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzePackageJson>> | null>(
    null
  );
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPackageJson(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setAnalyzing(true);
    try {
      const result = await analyzePackageJson(packageJson);
      setAnalysis(result);
    } catch (err) {
      setError('Invalid package.json format. Please check your input.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarfieldEffect />
      
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      <div className="relative z-10">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <FileJson className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Dependency Analyzer</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Package.json Analyzer
              </h1>
              <p className="text-muted-foreground">
                Upload or paste your package.json to get a complete health report
              </p>
            </div>

            {!analysis ? (
              <div className="glass-card p-8 animate-fade-in-up animation-delay-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                        <span>
                          <Upload className="h-4 w-4" />
                          Upload package.json
                        </span>
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <span className="text-sm text-muted-foreground">or paste below</span>
                  </div>

                  <Textarea
                    value={packageJson}
                    onChange={(e) => setPackageJson(e.target.value)}
                    placeholder='Paste your package.json content here...'
                    className="font-mono text-sm min-h-[300px] bg-secondary"
                  />

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={!packageJson || analyzing}
                    className="w-full gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Analyzing Dependencies...
                      </>
                    ) : (
                      <>
                        <FileJson className="h-4 w-4" />
                        Analyze Dependencies
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat-card">
                    <span className="stat-label">Total Packages</span>
                    <span className="stat-value text-2xl">{analysis.summary.total}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Healthy
                    </span>
                    <span className="stat-value text-2xl text-green-500">
                      {analysis.summary.healthy}
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      Outdated
                    </span>
                    <span className="stat-value text-2xl text-yellow-500">
                      {analysis.summary.outdated}
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Vulnerable
                    </span>
                    <span className="stat-value text-2xl text-red-500">
                      {analysis.summary.vulnerable}
                    </span>
                  </div>
                </div>

                {/* Project Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    Project Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Project Name</p>
                      <p className="font-semibold">{analysis.projectInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Version</p>
                      <p className="font-semibold font-mono">{analysis.projectInfo.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Dependencies</p>
                      <p className="font-semibold">{analysis.summary.total}</p>
                    </div>
                  </div>
                  {analysis.projectInfo.description && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">{analysis.projectInfo.description}</p>
                    </div>
                  )}
                </div>

                {/* AI-Powered Features */}
                <div className="space-y-6">
                  {/* Project Health Score */}
                  <ProjectHealthScore
                    score={analysis.healthScore.score}
                    grade={analysis.healthScore.grade}
                    factors={analysis.healthScore.factors}
                  />

                  {/* AI Recommendations */}
                  <AIRecommendations recommendations={analysis.aiRecommendations} />

                  {/* Optimization Suggestions */}
                  <OptimizationSuggestions suggestions={analysis.optimizationSuggestions} />
                </div>

                {/* Charts and Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Health Status Chart */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Package Health Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Healthy', value: analysis.summary.healthy, color: '#22c55e' },
                            { name: 'Outdated', value: analysis.summary.outdated, color: '#eab308' },
                            { name: 'Vulnerable', value: analysis.summary.vulnerable, color: '#ef4444' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Healthy', value: analysis.summary.healthy, color: '#22c55e' },
                            { name: 'Outdated', value: analysis.summary.outdated, color: '#eab308' },
                            { name: 'Vulnerable', value: analysis.summary.vulnerable, color: '#ef4444' },
                          ]
                            .filter(d => d.value > 0)
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* TypeScript Support Chart */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      TypeScript Support
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'With Types', value: analysis.typeScriptSupport.withTypes, color: '#3b82f6' },
                            { name: 'Without Types', value: analysis.typeScriptSupport.withoutTypes, color: '#94a3b8' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'With Types', value: analysis.typeScriptSupport.withTypes, color: '#3b82f6' },
                            { name: 'Without Types', value: analysis.typeScriptSupport.withoutTypes, color: '#94a3b8' },
                          ]
                            .filter(d => d.value > 0)
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {analysis.typeScriptSupport.withTypes > 0 ? (
                          <>
                            <span className="text-primary font-semibold">
                              {((analysis.typeScriptSupport.withTypes / analysis.summary.total) * 100).toFixed(1)}%
                            </span>
                            {' '}of packages have TypeScript support
                          </>
                        ) : (
                          'No packages with TypeScript support'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* License Distribution Chart */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-primary" />
                      License Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(analysis.licenseDistribution)
                          .map(([name, value]) => ({ name, value }))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 8)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Download Statistics */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Download Statistics
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Total Weekly Downloads</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatDownloads(analysis.totalDownloads)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent animate-pulse-slow"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Average per Package</span>
                          <span className="text-xl font-bold text-accent">
                            {formatDownloads(analysis.avgDownloads)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{
                              width: `${Math.min(
                                (analysis.avgDownloads / (analysis.totalDownloads / analysis.summary.total)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Most Popular</p>
                            <p className="text-sm font-semibold truncate">
                              {[...analysis.dependencies, ...analysis.devDependencies]
                                .sort((a, b) => b.weeklyDownloads - a.weeklyDownloads)[0]?.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <Package className="h-8 w-8 text-accent mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Total Packages</p>
                            <p className="text-sm font-semibold">{analysis.summary.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dependency Type Comparison */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Dependency Type Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Production Dependencies</span>
                        <span className="text-2xl font-bold text-primary">{analysis.dependencies.length}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${(analysis.dependencies.length / analysis.summary.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((analysis.dependencies.length / analysis.summary.total) * 100).toFixed(1)}% of total packages
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Development Dependencies</span>
                        <span className="text-2xl font-bold text-accent">{analysis.devDependencies.length}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{
                            width: `${(analysis.devDependencies.length / analysis.summary.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((analysis.devDependencies.length / analysis.summary.total) * 100).toFixed(1)}% of total packages
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Key Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Health Score</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.summary.healthy > 0 ? (
                            <>
                              <span className="text-green-500 font-semibold">
                                {((analysis.summary.healthy / analysis.summary.total) * 100).toFixed(0)}%
                              </span>{' '}
                              of your dependencies are up-to-date and healthy
                            </>
                          ) : (
                            'No healthy packages found. Consider updating your dependencies.'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Updates Available</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.summary.outdated > 0 ? (
                            <>
                              <span className="text-yellow-500 font-semibold">{analysis.summary.outdated}</span>{' '}
                              {analysis.summary.outdated === 1 ? 'package needs' : 'packages need'} updating
                            </>
                          ) : (
                            'All packages are up-to-date! 🎉'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <FileJson className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">TypeScript Adoption</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.typeScriptSupport.withTypes > 0 ? (
                            <>
                              <span className="text-blue-500 font-semibold">
                                {analysis.typeScriptSupport.withTypes}
                              </span>{' '}
                              {analysis.typeScriptSupport.withTypes === 1 ? 'package has' : 'packages have'} built-in types
                            </>
                          ) : (
                            'No packages with built-in TypeScript types'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Popularity Index</p>
                        <p className="text-xs text-muted-foreground">
                          Average of{' '}
                          <span className="text-purple-500 font-semibold">
                            {formatDownloads(analysis.avgDownloads)}
                          </span>{' '}
                          downloads per package per week
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dependencies List */}
                {analysis.dependencies.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Dependencies ({analysis.dependencies.length})
                    </h3>
                    <div className="space-y-2">
                      {analysis.dependencies.map((dep) => (
                        <DependencyRow key={dep.name} dep={dep} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dev Dependencies List */}
                {analysis.devDependencies.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Dev Dependencies ({analysis.devDependencies.length})
                    </h3>
                    <div className="space-y-2">
                      {analysis.devDependencies.map((dep) => (
                        <DependencyRow key={dep.name} dep={dep} />
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysis(null);
                    setPackageJson('');
                  }}
                  className="w-full"
                >
                  Analyze Another Package
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DependencyRow({ dep }: { dep: PackageAnalysis }) {
  const statusConfig = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Up to date' },
    outdated: { icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Update available' },
    vulnerable: { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Vulnerable' },
    deprecated: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Deprecated' },
  };

  const config = statusConfig[dep.status];
  const Icon = config.icon;

  // Calculate download popularity (relative to 1M downloads as "very popular")
  const popularityPercentage = Math.min((dep.weeklyDownloads / 1000000) * 100, 100);

  return (
    <div className="group p-4 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.color}`} />
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                to={`/package/${encodeURIComponent(dep.name)}`}
                className="font-mono text-sm font-medium hover:text-primary hover:underline inline-block"
              >
                {dep.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color} font-medium`}>
                  {config.label}
                </span>
                {dep.hasTypes && (
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">
                    TypeScript
                  </span>
                )}
                {(dep.dependencyCount ?? 0) === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">
                    Zero Deps
                  </span>
                )}
              </div>
            </div>
            <Link to={`/package/${encodeURIComponent(dep.name)}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Version Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">
              v{dep.currentVersion}
              {dep.isOutdated && (
                <span className="text-yellow-500 font-semibold"> → v{dep.latestVersion}</span>
              )}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              {dep.license}
            </span>
            {(dep.dependencyCount ?? 0) > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {dep.dependencyCount} {dep.dependencyCount === 1 ? 'dep' : 'deps'}
                </span>
              </>
            )}
          </div>

          {/* Download Stats with Visual Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Weekly Downloads</span>
              <span className="font-semibold text-primary">{formatDownloads(dep.weeklyDownloads)}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${Math.max(popularityPercentage, 2)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
