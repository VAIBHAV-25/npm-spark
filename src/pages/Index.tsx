import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchBox } from '@/components/SearchBox';
import { PackageCard } from '@/components/PackageCard';
import { PackageCardSkeleton } from '@/components/Skeletons';
import { usePackageSearch, useMultipleDownloads } from '@/hooks/usePackages';
import { popularPackages } from '@/lib/npm-api';
import { Package, TrendingUp, Zap, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { AISearchResults } from '@/components/AISearchResults';

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  // Fetch popular packages for the carousel
  const { data: trendingData, isLoading: trendingLoading } = usePackageSearch('downloads:>1000000', true);
  const trendingPackages = trendingData?.pages[0]?.objects.slice(0, 6) || [];
  const trendingNames = trendingPackages.map((p) => p.package.name);
  const { data: trendingDownloads } = useMultipleDownloads(trendingNames);
  
  const downloadsMap = new Map(
    trendingDownloads?.map((d) => [d.package, d.downloads]) || []
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Starfield Effect */}
      <StarfieldEffect />

      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      {/* Animated Grid Background */}
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

      {/* Floating Particles */}
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
        <Header showSearch={false} />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-24 px-4 overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow-delayed" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-spin-slow" />
            </div>

            {/* Animated Lines */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-slide-down" />
              <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-accent/50 to-transparent animate-slide-down-delayed" />
            </div>

            <div className="relative container max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Fast NPM Package Explorer</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up animation-delay-200">
              Explore the{' '}
              <span className="gradient-text animate-gradient">NPM Registry</span>
              <br />
              at lightning speed
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              Search, compare, and explore over 2 million packages. Get detailed insights, 
              download trends, and make informed decisions for your next project.
            </p>

            <div className="animate-fade-in-up animation-delay-600">
              <SearchBox 
                large 
                autoFocus 
                onChange={(value) => setSearchQuery(value)}
              />
              {searchQuery && searchQuery.trim().length > 0 && (
                <div className="mt-4">
                  <AISearchResults query={searchQuery} />
                </div>
              )}
            </div>

            {!searchQuery && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in-up animation-delay-800">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {popularPackages.slice(0, 8).map((pkg, index) => (
                  <Link
                    key={pkg}
                    to={`/package/${pkg}`}
                    className="chip hover:bg-primary/20 hover:text-primary transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                    style={{ animationDelay: `${800 + index * 50}ms` }}
                  >
                    {pkg}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up">
                <Search className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Search</h3>
                <p className="text-sm text-muted-foreground">
                  Instant search across millions of packages with real-time results and keyboard navigation.
                </p>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-200">
                <TrendingUp className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Download Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize download trends over time and make data-driven package decisions.
                </p>
              </div>
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-400">
                <Package className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Side-by-Side Compare</h3>
                <p className="text-sm text-muted-foreground">
                  Compare packages head-to-head with detailed metrics and insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Packages */}
        <section className="py-16 border-t border-border">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                Trending Packages
              </h2>
              <Link 
                to="/search?q=downloads:>1000000" 
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PackageCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingPackages.map((result) => (
                  <PackageCard
                    key={result.package.name}
                    result={result}
                    downloads={downloadsMap.get(result.package.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="py-16 border-t border-border">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-foreground mb-6">Keyboard Shortcuts</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <kbd className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center font-mono text-sm">/</kbd>
                <span className="text-sm text-muted-foreground">Focus search</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <kbd className="h-8 px-2 rounded border border-border bg-muted flex items-center justify-center font-mono text-sm">Esc</kbd>
                <span className="text-sm text-muted-foreground">Blur search</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <kbd className="h-8 px-2 rounded border border-border bg-muted flex items-center justify-center font-mono text-sm">Enter</kbd>
                <span className="text-sm text-muted-foreground">Submit search</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container text-center">
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, and the NPM Registry API.
              <br />
              Data provided by npmjs.org.
            </p>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
};

export default Index;
