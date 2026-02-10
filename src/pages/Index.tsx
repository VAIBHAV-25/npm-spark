import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchBox } from '@/components/SearchBox';
import { PackageCard } from '@/components/PackageCard';
import { PackageCardSkeleton } from '@/components/Skeletons';
import { usePackageSearch, useMultipleDownloads } from '@/hooks/usePackages';
import { popularPackages } from '@/lib/npm-api';
import { Package, TrendingUp, Zap, Search, Shield, GitCompare, Brain, FileCode, Sparkles, ArrowRight, BarChart3, Lock, Rocket, Code2, CheckCircle2, Star, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { AISearchResults } from '@/components/AISearchResults';
import { Button } from '@/components/ui/button';

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

            <div className="relative container max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">AI-Powered NPM Package Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up animation-delay-200">
              Explore NPM Packages
              <br />
              <span className="gradient-text animate-gradient">Smarter & Faster</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Search, compare, and analyze over <span className="text-primary font-semibold">2+ million packages</span>. 
              Make data-driven decisions with AI-powered insights, security analysis, and intelligent recommendations.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 animate-fade-in-up animation-delay-500">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">Real-time Data</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">AI Recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Security Scanning</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Lightning Fast</span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
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
              <>
                <div className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in-up animation-delay-800">
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

                <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in-up animation-delay-1000">
                  <Link to="/compare">
                    <Button size="lg" className="gap-2 group">
                      <GitCompare className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      Compare Packages
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/analyzer">
                    <Button size="lg" variant="outline" className="gap-2 group">
                      <FileCode className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Analyze Package.json
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-t border-border bg-muted/20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-fade-in-up">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2M+</div>
                <div className="text-sm text-muted-foreground">NPM Packages</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-100">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">AI Features</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-200">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">Real-time</div>
                <div className="text-sm text-muted-foreground">Data Updates</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-300">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Free & Open</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 border-t border-border">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Make Smart Decisions
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features designed to save you time and help you choose the right packages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI Natural Language Search</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your problem in plain English and get intelligent package recommendations powered by AI.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-100 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <GitCompare className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Package Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Compare packages side-by-side with AI-powered recommendations, risk assessment, and migration difficulty analysis.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-200 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Security Vulnerability Scanner</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time security analysis with vulnerability detection and severity ratings for every package.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-300 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileCode className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Package.json Analyzer</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your package.json and get AI-powered upgrade suggestions, security alerts, and optimization recommendations.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-400 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Rocket className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Detailed Migration Guides</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated step-by-step migration guides with code examples, common issues, and testing strategies.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-500 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Visual Analytics & Charts</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts for downloads, dependencies, bundle sizes, and trends to visualize package metrics.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-600 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Lock className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">License Compatibility Checker</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically check license compatibility with your project and get instant compatibility reports.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-700 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Code2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">TypeScript Coverage Score</h3>
                <p className="text-sm text-muted-foreground">
                  Evaluate TypeScript support quality with detailed coverage scores and type definition analysis.
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group animate-fade-in-up animation-delay-800 border-l-4 border-l-primary">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Download Trends & Predictions</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize historical download data and get AI-powered predictions for future package adoption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm text-primary font-medium">Why NPM Spark?</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Make Better Package Decisions in Seconds
                </h2>
                <p className="text-lg text-muted-foreground">
                  NPM Spark goes beyond basic search. We provide AI-powered insights, security analysis, 
                  and intelligent recommendations to help you choose the right packages for your project.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">AI-Powered Intelligence</h4>
                      <p className="text-sm text-muted-foreground">Get smart recommendations based on your specific needs and project requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Comprehensive Security Analysis</h4>
                      <p className="text-sm text-muted-foreground">Stay safe with real-time vulnerability scanning and risk assessments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Data-Driven Comparisons</h4>
                      <p className="text-sm text-muted-foreground">Compare packages with weighted scoring, risk factors, and migration insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Time-Saving Tools</h4>
                      <p className="text-sm text-muted-foreground">Automated analysis, instant insights, and detailed migration guides save hours of research</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="glass-card p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '95%' }} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">95% Recommendation Accuracy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Real-time Security Scanning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Lightning Fast Search</p>
                    </div>
                  </div>
                </div>
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

        {/* CTA Section */}
        <section className="py-20 border-t border-border">
          <div className="container">
            <div className="glass-card p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient" />
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Find Your Perfect Package?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of developers making smarter package decisions with AI-powered insights
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/search">
                    <Button size="lg" className="gap-2 group">
                      <Search className="h-5 w-5" />
                      Start Searching
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/compare">
                    <Button size="lg" variant="outline" className="gap-2">
                      <GitCompare className="h-5 w-5" />
                      Compare Packages
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="py-16 border-t border-border">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">⚡ Keyboard Shortcuts</h2>
              <p className="text-muted-foreground">Navigate faster with keyboard commands</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                <kbd className="h-12 w-12 rounded-lg border-2 border-primary/30 bg-primary/10 flex items-center justify-center font-mono text-lg font-bold text-primary">/</kbd>
                <div className="text-center">
                  <div className="font-medium text-foreground">Focus Search</div>
                  <div className="text-xs text-muted-foreground">Quick access to search</div>
                </div>
              </div>
              <div className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                <kbd className="h-12 px-4 rounded-lg border-2 border-primary/30 bg-primary/10 flex items-center justify-center font-mono text-sm font-bold text-primary">Esc</kbd>
                <div className="text-center">
                  <div className="font-medium text-foreground">Close/Clear</div>
                  <div className="text-xs text-muted-foreground">Exit search or modals</div>
                </div>
              </div>
              <div className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                <kbd className="h-12 px-4 rounded-lg border-2 border-primary/30 bg-primary/10 flex items-center justify-center font-mono text-sm font-bold text-primary">Enter</kbd>
                <div className="text-center">
                  <div className="font-medium text-foreground">Submit</div>
                  <div className="text-xs text-muted-foreground">Execute search query</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="font-bold text-foreground text-lg">NPM Spark</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered NPM package intelligence platform. Make smarter decisions with real-time insights.
                </p>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary font-mono">React</div>
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary font-mono">TypeScript</div>
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary font-mono">AI</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/search" className="hover:text-primary transition-colors">Package Search</Link></li>
                  <li><Link to="/compare" className="hover:text-primary transition-colors">Compare Packages</Link></li>
                  <li><Link to="/analyzer" className="hover:text-primary transition-colors">Package.json Analyzer</Link></li>
                  <li><Link to="/collections" className="hover:text-primary transition-colors">Collections</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://npmjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">NPM Registry</a></li>
                  <li><a href="https://bundlephobia.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Bundlephobia</a></li>
                  <li><span className="text-muted-foreground/50">Documentation</span></li>
                  <li><span className="text-muted-foreground/50">API</span></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Built with ❤️ using React, TypeScript, and the NPM Registry API
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Data provided by npmjs.org • Not affiliated with npm, Inc.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Created by</span>
                <a 
                  href="https://www.linkedin.com/in/vaibhav-singhvi-p16102001/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors group"
                >
                  <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Vaibhav Singhvi</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
};

export default Index;
