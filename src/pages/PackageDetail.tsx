import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InstallCommand } from '@/components/InstallCommand';
import { DownloadsChart } from '@/components/DownloadsChart';
import { ReadmeViewer } from '@/components/ReadmeViewer';
import { PackageDetailSkeleton } from '@/components/Skeletons';
import { usePackageDetails, useWeeklyDownloads } from '@/hooks/usePackages';
import { formatDownloads, formatDate, formatBytes, extractGitHubInfo, getGitHubUrl } from '@/lib/npm-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { useState } from 'react';

export default function PackageDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');
  
  const { data: pkg, isLoading, error } = usePackageDetails(decodedName);
  const { data: downloads } = useWeeklyDownloads(decodedName);
  const [showAllVersions, setShowAllVersions] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <PackageDetailSkeleton />
        </main>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="glass-card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="stat-card">
                  <span className="stat-label">License</span>
                  <span className="stat-value font-mono">{pkg.license || 'N/A'}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Dependencies</span>
                  <span className="stat-value">{depsCount}</span>
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
              </div>
            </div>

            {/* Install Command */}
            <InstallCommand packageName={pkg.name} />

            {/* Tabs */}
            <Tabs defaultValue="readme" className="w-full">
              <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 gap-0">
                <TabsTrigger
                  value="readme"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  README
                </TabsTrigger>
                <TabsTrigger
                  value="versions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Versions ({versions.length})
                </TabsTrigger>
                <TabsTrigger
                  value="dependencies"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Dependencies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="readme" className="mt-6">
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

                  {depsCount === 0 && peerDepsCount === 0 && (
                    <div className="glass-card p-8 text-center">
                      <p className="text-muted-foreground">No dependencies</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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
  );
}
