import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { PackageCard } from '@/components/PackageCard';
import { PackageCardSkeleton } from '@/components/Skeletons';
import { usePackageSearch, useMultipleDownloads } from '@/hooks/usePackages';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
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
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Search results for "{query}"
            </h1>
            {data && (
              <p className="text-muted-foreground">
                Found {data.pages[0]?.total.toLocaleString()} packages
              </p>
            )}
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

        {allPackages.length > 0 && (
          <div className="space-y-4">
            {allPackages.map((result) => (
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
