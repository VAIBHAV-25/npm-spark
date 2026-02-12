import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InstallCommand } from '@/components/InstallCommand';
import { DownloadsChart } from '@/components/DownloadsChart';
import { ReadmeViewer } from '@/components/ReadmeViewer';
import { PackageDetailSkeleton } from '@/components/Skeletons';
import { usePackageDetails, useWeeklyDownloads, usePackageSearchScore } from '@/hooks/usePackages';
import { formatDownloads, formatDate, formatBytes, extractGitHubInfo, getGitHubUrl } from '@/lib/npm-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSaved } from '@/hooks/useSaved';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Package,
  Calendar,
  Scale,
  FileCode,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Eye,
  Share2,
  Hash,
  Download,
  Tag,
  Cpu,
  FileArchive,
  ShieldCheck,
  FileJson,
  GitCompare,
  Network,
  Code,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { BundleSizeCard } from '@/components/BundleSizeCard';
import { GitHubMetrics } from '@/components/GitHubMetrics';
import { SimilarPackages } from '@/components/SimilarPackages';
import { PackageHealthCard } from '@/components/PackageHealthCard';
import { PackageTrendPredictor } from '@/components/PackageTrendPredictor';
import { FrequentlyPairedPackages } from '@/components/FrequentlyPairedPackages';
import { VersionUpdateAdvisor } from '@/components/VersionUpdateAdvisor';
import { SecurityScanner } from '@/components/SecurityScanner';
import { LicenseChecker } from '@/components/LicenseChecker';
import { TypeScriptScore } from '@/components/TypeScriptScore';
import { DependencyGraph } from '@/components/DependencyGraph';
import { VersionDiff } from '@/components/VersionDiff';
import { AddToCollection } from '@/components/AddToCollection';
import { AIPackageSummary } from '@/components/AIPackageSummary';
import { AICodeSnippets } from '@/components/AICodeSnippets';
import { AICommunitySentiment } from '@/components/AICommunitySentiment';

export default function PackageDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');
  
  const { data: pkg, isLoading, error } = usePackageDetails(decodedName);
  const { data: downloads } = useWeeklyDownloads(decodedName);
  const { data: score } = usePackageSearchScore(decodedName, !!decodedName);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const saved = useSaved();
  const { toast } = useToast();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLoading) {
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
            <PackageDetailSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
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
            <div className="glass-card p-8 text-center animate-fade-in-up">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4 animate-pulse" />
              <h1 className="text-xl font-semibold mb-2">Package not found</h1>
              <p className="text-muted-foreground mb-4">
                The package "{decodedName}" could not be found.
              </p>
              <Link to="/">
                <Button>Back to home</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const latestVersion = pkg['dist-tags'].latest;
  const latestInfo = pkg.versions[latestVersion];
  const gitHub = extractGitHubInfo(pkg.repository?.url);
  const versions = Object.keys(pkg.versions).reverse();
  const displayVersions = showAllVersions ? versions : versions.slice(0, 10);

  const depsCount = Object.keys(latestInfo?.dependencies || {}).length;
  const devDepsCount = Object.keys(latestInfo?.devDependencies || {}).length;
  const peerDepsCount = Object.keys(latestInfo?.peerDependencies || {}).length;
  const fav = saved.isSaved('favorites', pkg.name);
  const watch = saved.isSaved('watchlist', pkg.name);
  const tagsCount = Object.keys(pkg['dist-tags'] || {}).length;
  const fileCount = latestInfo?.dist?.fileCount;
  const hasTypes = Boolean(latestInfo?.types || latestInfo?.typings);
  const hasEsm = Boolean(latestInfo?.module || latestInfo?.type === 'module');
  const createdAt = pkg.time?.created;
  const modifiedAt = pkg.time?.modified;
  const nodeEngine = latestInfo?.engines?.node;
  const npmUrl = `https://www.npmjs.com/package/${encodeURIComponent(pkg.name).replace('%40', '@')}`;

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
        
        <main className="container py-8" id="main-content" tabIndex={-1}>
        <div className="mb-6 animate-fade-in-up">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:scale-105 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4 animate-fade-in-up animation-delay-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-mono text-3xl font-bold text-foreground flex items-center gap-3">
                    {pkg.name}
                    <span className="badge-primary text-base">v{latestVersion}</span>
                  </h1>
                  {pkg.description && (
                    <p className="text-muted-foreground mt-2 text-lg">{pkg.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2"
                    onClick={() => saved.toggleSaved('favorites', pkg.name)}
                  >
                    <Star className={fav ? "h-4 w-4 text-primary" : "h-4 w-4"} />
                    <span className="hidden sm:inline">{fav ? "Favorited" : "Favorite"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2"
                    onClick={() => saved.toggleSaved('watchlist', pkg.name)}
                  >
                    <Eye className={watch ? "h-4 w-4 text-primary" : "h-4 w-4"} />
                    <span className="hidden sm:inline">{watch ? "Watching" : "Watch"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2"
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied!",
                        description: "Package link has been copied to clipboard.",
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy link</span>
                  </Button>
                  <AddToCollection packageName={pkg.name} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {gitHub && (
                  <a
                    href={getGitHubUrl(gitHub)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    {gitHub.owner}/{gitHub.repo}
                  </a>
                )}
                {pkg.homepage && (
                  <a
                    href={pkg.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Homepage
                  </a>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 animate-fade-in-up animation-delay-400">
                <div className="stat-card hover:scale-105 transition-transform">
                  <span className="stat-label">License</span>
                  <span className="stat-value font-mono">{pkg.license || 'N/A'}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Deps / Dev / Peer</span>
                  <span className="stat-value">{depsCount} / {devDepsCount} / {peerDepsCount}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Install Size</span>
                  <span className="stat-value">
                    {latestInfo?.dist?.unpackedSize
                      ? formatBytes(latestInfo.dist.unpackedSize)
                      : 'N/A'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Published</span>
                  <span className="stat-value text-base">
                    {pkg.time[latestVersion] ? formatDate(pkg.time[latestVersion]) : 'N/A'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Weekly Downloads</span>
                  <span className="stat-value text-primary">
                    {downloads ? formatDownloads(downloads.downloads) : '—'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Versions / Tags</span>
                  <span className="stat-value">{versions.length} / {tagsCount}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a href={npmUrl} target="_blank" rel="noopener noreferrer" className="chip hover:bg-primary/20 hover:text-primary">
                  Open on npm
                </a>
                {hasTypes && <span className="chip">TypeScript</span>}
                {hasEsm && <span className="chip">ESM</span>}
                {nodeEngine && <span className="chip">Node {nodeEngine}</span>}
                {createdAt && <span className="chip">Created {formatDate(createdAt)}</span>}
                {modifiedAt && <span className="chip">Updated {formatDate(modifiedAt)}</span>}
              </div>
            </div>

            {/* Install Command */}
            <div className="animate-fade-in-up animation-delay-600">
              <InstallCommand packageName={pkg.name} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="readme" className="w-full animate-fade-in-up animation-delay-800">
              <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 gap-0 overflow-x-auto flex-nowrap">
                <TabsTrigger
                  value="readme"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <FileCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">README</span>
                  <span className="sm:hidden">README</span>
                </TabsTrigger>
                <TabsTrigger
                  value="versions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Versions ({versions.length})</span>
                  <span className="sm:hidden">Versions</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dependencies"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dependencies</span>
                  <span className="sm:hidden">Deps</span>
                </TabsTrigger>
                <TabsTrigger
                  value="version-migration"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <GitCompare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Version Migration</span>
                  <span className="sm:hidden">Migration</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dependency-tree"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Network className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dependency Tree</span>
                  <span className="sm:hidden">Tree</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code-snippets"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Code Snippets</span>
                  <span className="sm:hidden">Code</span>
                  <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 ml-1 text-primary" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="readme" className="mt-6 space-y-6">
                {/* AI Package Summary - Auto-generated at top */}
                <AIPackageSummary 
                  packageName={pkg.name}
                  description={pkg.description}
                  downloads={downloads?.downloads}
                  license={pkg.license}
                />

                {/* README Content */}
                <div className="glass-card p-6">
                  {pkg.readme ? (
                    <ReadmeViewer content={pkg.readme} packageName={pkg.name} />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No README available
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="versions" className="mt-6">
                <div className="glass-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                          Version
                        </th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                          Published
                        </th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                          Size
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayVersions.map((version) => {
                        const versionInfo = pkg.versions[version];
                        const isLatest = version === latestVersion;
                        return (
                          <tr key={version} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-foreground">
                                {version}
                              </span>
                              {isLatest && (
                                <span className="ml-2 badge-success text-xs">latest</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-sm">
                              {pkg.time[version] ? formatDate(pkg.time[version]) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell">
                              {versionInfo?.dist?.unpackedSize
                                ? formatBytes(versionInfo.dist.unpackedSize)
                                : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {versions.length > 10 && (
                    <button
                      onClick={() => setShowAllVersions(!showAllVersions)}
                      className="w-full px-4 py-3 text-sm text-primary hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllVersions ? (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4" />
                          Show all {versions.length} versions
                        </>
                      )}
                    </button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-6">
                <div className="space-y-4">
                  {depsCount > 0 && (
                    <div className="glass-card">
                      <div className="px-4 py-3 border-b border-border">
                        <h4 className="text-sm font-medium text-foreground">
                          Dependencies ({depsCount})
                        </h4>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {Object.entries(latestInfo?.dependencies || {}).map(([dep, version]) => (
                          <Link
                            key={dep}
                            to={`/package/${encodeURIComponent(dep)}`}
                            className="chip hover:bg-primary/20 hover:text-primary"
                          >
                            {dep}
                            <span className="ml-1 text-muted-foreground">{version}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {devDepsCount > 0 && (
                    <div className="glass-card">
                      <div className="px-4 py-3 border-b border-border">
                        <h4 className="text-sm font-medium text-foreground">
                          Dev Dependencies ({devDepsCount})
                        </h4>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {Object.entries(latestInfo?.devDependencies || {}).map(([dep, version]) => (
                          <Link
                            key={dep}
                            to={`/package/${encodeURIComponent(dep)}`}
                            className="chip hover:bg-primary/20 hover:text-primary"
                          >
                            {dep}
                            <span className="ml-1 text-muted-foreground">{version}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {peerDepsCount > 0 && (
                    <div className="glass-card">
                      <div className="px-4 py-3 border-b border-border">
                        <h4 className="text-sm font-medium text-foreground">
                          Peer Dependencies ({peerDepsCount})
                        </h4>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {Object.entries(latestInfo?.peerDependencies || {}).map(([dep, version]) => (
                          <Link
                            key={dep}
                            to={`/package/${encodeURIComponent(dep)}`}
                            className="chip hover:bg-primary/20 hover:text-primary"
                          >
                            {dep}
                            <span className="ml-1 text-muted-foreground">{version}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {depsCount === 0 && devDepsCount === 0 && peerDepsCount === 0 && (
                    <div className="glass-card p-8 text-center">
                      <p className="text-muted-foreground">No dependencies</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="version-migration" className="mt-6">
                <VersionDiff packageName={pkg.name} versions={versions.slice(0, 20)} />
              </TabsContent>

              <TabsContent value="dependency-tree" className="mt-6">
                <DependencyGraph packageName={pkg.name} version={latestVersion} maxDepth={2} />
              </TabsContent>

              <TabsContent value="code-snippets" className="mt-6">
                <AICodeSnippets 
                  packageName={pkg.name}
                  version={latestVersion}
                />
              </TabsContent>
            </Tabs>

            {/* AI Features Section */}
            <div className="mt-8 space-y-6">

              {/* AI Community Sentiment */}
              <AICommunitySentiment packageName={pkg.name} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in-up animation-delay-400">
            {/* Package Health */}
            <PackageHealthCard pkg={pkg} score={score} />

            {/* Security Scanner */}
            <SecurityScanner packageName={pkg.name} version={latestVersion} license={pkg.license} />

            {/* License Checker */}
            <LicenseChecker license={latestInfo?.license} packageName={pkg.name} />

            {/* TypeScript Support */}
            <TypeScriptScore packageName={pkg.name} version={latestVersion} />

            {/* Version Update Advisor */}
            <VersionUpdateAdvisor pkg={pkg} currentVersion={latestVersion} />

            {/* Bundle Size */}
            <BundleSizeCard packageName={pkg.name} version={latestVersion} />

            {/* GitHub Metrics */}
            <GitHubMetrics repositoryUrl={pkg.repository?.url} />

            {/* Downloads Chart */}
            <DownloadsChart packageName={decodedName} />

            {/* Weekly Downloads */}
            {downloads && (
              <div className="stat-card">
                <span className="stat-label">Weekly Downloads</span>
                <span className="stat-value text-2xl text-primary">
                  {formatDownloads(downloads.downloads)}
                </span>
              </div>
            )}

            <div className="glass-card p-4 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Package Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Latest
                  </span>
                  <span className="stat-value font-mono">{latestVersion}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Tarball
                  </span>
                  <a
                    href={latestInfo?.dist?.tarball}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    Download
                  </a>
                </div>
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    shasum
                  </span>
                  <button
                    className="text-left font-mono text-xs text-muted-foreground break-all hover:text-foreground"
                    onClick={async () => {
                      if (latestInfo?.dist?.shasum) await navigator.clipboard.writeText(latestInfo.dist.shasum);
                    }}
                  >
                    {latestInfo?.dist?.shasum || 'N/A'}
                  </button>
                </div>
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    integrity
                  </span>
                  <button
                    className="text-left font-mono text-xs text-muted-foreground break-all hover:text-foreground"
                    onClick={async () => {
                      if (latestInfo?.dist?.integrity) await navigator.clipboard.writeText(latestInfo.dist.integrity);
                    }}
                  >
                    {latestInfo?.dist?.integrity || 'N/A'}
                  </button>
                </div>
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <FileArchive className="h-4 w-4" />
                    Files
                  </span>
                  <span className="stat-value">{fileCount ?? 'N/A'}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Engines
                  </span>
                  <span className="stat-value text-sm font-mono">
                    {nodeEngine || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {score && (
              <div className="glass-card p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
                  NPM Score
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat-card">
                    <span className="stat-label">Final</span>
                    <span className="stat-value text-primary">{(score.score.final * 100).toFixed(0)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Search score</span>
                    <span className="stat-value">{score.searchScore.toFixed(2)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Quality</span>
                    <span className="stat-value">{(score.score.detail.quality * 100).toFixed(0)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Popularity</span>
                    <span className="stat-value">{(score.score.detail.popularity * 100).toFixed(0)}</span>
                  </div>
                  <div className="stat-card col-span-2">
                    <span className="stat-label">Maintenance</span>
                    <span className="stat-value">{(score.score.detail.maintenance * 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Keywords */}
            {pkg.keywords && pkg.keywords.length > 0 && (
              <div className="glass-card p-4">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.keywords.map((keyword) => (
                    <Link
                      key={keyword}
                      to={`/search?q=${encodeURIComponent(keyword)}`}
                      className="chip"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Maintainers */}
            {pkg.maintainers && pkg.maintainers.length > 0 && (
              <div className="glass-card p-4">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maintainers ({pkg.maintainers.length})
                </h4>
                <div className="space-y-2">
                  {pkg.maintainers.slice(0, 5).map((maintainer) => (
                    <a
                      key={maintainer.name}
                      href={`https://www.npmjs.com/~${maintainer.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {maintainer.name[0].toUpperCase()}
                      </div>
                      ~{maintainer.name}
                    </a>
                  ))}
                  {pkg.maintainers.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{pkg.maintainers.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* AI Trend Prediction */}
            <PackageTrendPredictor packageName={pkg.name} />

            {/* Frequently Paired Packages */}
            <FrequentlyPairedPackages packageName={pkg.name} />

            {/* Similar Packages */}
            <SimilarPackages packageName={pkg.name} />

            {/* Last Publish */}
            <div className="stat-card">
              <span className="stat-label flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Published
              </span>
              <span className="stat-value text-base">
                {pkg.time[latestVersion] ? formatDate(pkg.time[latestVersion]) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
