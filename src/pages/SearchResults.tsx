import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PackageCard } from '@/components/PackageCard';
import { PackageCardSkeleton } from '@/components/Skeletons';
import { usePackageSearch, useMultipleDownloads } from '@/hooks/usePackages';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<SearchFiltersState>({});
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePackageSearch(query);

  const allPackages = data?.pages.flatMap((page) => page.objects) || [];
  const packageNames = allPackages.map((p) => p.package.name);
  const { data: downloadsData } = useMultipleDownloads(packageNames.slice(0, 20));

  const downloadsMap = new Map(
    downloadsData?.map((d) => [d.package, d.downloads]) || []
  );

  // Apply filters
  const filteredPackages = useMemo(() => {
    return allPackages.filter((result) => {
      const pkg = result.package;
      const downloads = downloadsMap.get(pkg.name) || 0;

      // Min downloads filter
      if (filters.minDownloads && downloads < filters.minDownloads) {
        return false;
      }

      // License filter
      if (filters.license && filters.license.length > 0) {
        const pkgLicense = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type;
        if (!pkgLicense || !filters.license.includes(pkgLicense)) {
          return false;
        }
      }

      // Framework filter
      if (filters.frameworks && filters.frameworks.length > 0) {
        const keywords = pkg.keywords || [];
        const hasFramework = filters.frameworks.some(
          (fw) => keywords.includes(fw) || pkg.name.includes(fw)
        );
        if (!hasFramework) {
          return false;
        }
      }

      // TypeScript filter
      if (filters.hasTypes) {
        const hasTypes = !!(pkg.types || pkg.typings);
        if (!hasTypes) {
          return false;
        }
      }

      // Zero dependencies filter
      if (filters.zeroDeps) {
        // We don't have dependencies info in search results, so we skip this
        // In a real app, you'd need to fetch this separately
      }

      return true;
    });
  }, [allPackages, filters, downloadsMap]);

  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-background">
      <Header initialQuery={query} />
      
      <main className="container py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>

        {query && (
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Search results for "{query}"
                </h1>
                {data && (
                  <p className="text-muted-foreground">
                    Found {data.pages[0]?.total.toLocaleString()} packages
                    {filteredPackages.length !== allPackages.length && (
                      <span className="text-primary">
                        {' '}• Showing {filteredPackages.length} after filters
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters({})}
            />
          </div>
        )}

        {error && (
          <div className="glass-card p-8 text-center">
            <p className="text-destructive">Error: {(error as Error).message}</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && allPackages.length === 0 && query && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No packages found for "{query}"</p>
          </div>
        )}

        {!isLoading && filteredPackages.length === 0 && allPackages.length > 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No packages match your filters. Try adjusting them.</p>
          </div>
        )}

        {filteredPackages.length > 0 && (
          <div className="space-y-4">
            {filteredPackages.map((result) => (
              <PackageCard
                key={result.package.name}
                result={result}
                downloads={downloadsMap.get(result.package.name)}
              />
            ))}

            <div ref={observerTarget} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
