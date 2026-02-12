import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AIComparisonSuggestionsProps {
  packageName: string;
}

interface Alternative {
  name: string;
  description: string;
  reason: string;
  similarity: number;
  trend: 'rising' | 'stable' | 'declining';
  bestFor: string;
}

function generateAlternatives(packageName: string): Alternative[] {
  const name = packageName.toLowerCase();
  
  const alternativesMap: Record<string, Alternative[]> = {
    'react': [
      {
        name: 'vue',
        description: 'Progressive JavaScript framework',
        reason: 'Easier learning curve, similar component-based architecture',
        similarity: 85,
        trend: 'rising',
        bestFor: 'Rapid prototyping and smaller teams',
      },
      {
        name: 'solid-js',
        description: 'Reactive JavaScript library',
        reason: 'Better performance, similar JSX syntax',
        similarity: 75,
        trend: 'rising',
        bestFor: 'Performance-critical applications',
      },
      {
        name: 'preact',
        description: 'Fast 3kB alternative to React',
        reason: 'Same API, much smaller bundle size',
        similarity: 95,
        trend: 'stable',
        bestFor: 'Bundle size-sensitive projects',
      },
    ],
    'express': [
      {
        name: 'fastify',
        description: 'Fast and low overhead web framework',
        reason: 'Better performance, modern async/await support',
        similarity: 80,
        trend: 'rising',
        bestFor: 'High-performance APIs',
      },
      {
        name: 'koa',
        description: 'Next-generation web framework',
        reason: 'Cleaner async/await, modern middleware',
        similarity: 85,
        trend: 'stable',
        bestFor: 'Modern Node.js applications',
      },
      {
        name: 'hapi',
        description: 'Rich framework for building applications',
        reason: 'Configuration-centric, built-in validation',
        similarity: 70,
        trend: 'stable',
        bestFor: 'Enterprise applications',
      },
    ],
    'axios': [
      {
        name: 'fetch',
        description: 'Native browser API',
        reason: 'No dependencies, built into browsers',
        similarity: 75,
        trend: 'stable',
        bestFor: 'Modern browsers without extra dependencies',
      },
      {
        name: 'ky',
        description: 'Tiny HTTP client based on Fetch',
        reason: 'Modern, lightweight, better error handling',
        similarity: 85,
        trend: 'rising',
        bestFor: 'Modern projects with small bundle size requirements',
      },
      {
        name: 'got',
        description: 'Human-friendly HTTP request library',
        reason: 'Node.js focused, extensive features',
        similarity: 80,
        trend: 'stable',
        bestFor: 'Node.js server-side applications',
      },
    ],
  };

  const matchedKey = Object.keys(alternativesMap).find(key => name.includes(key));
  
  if (matchedKey && alternativesMap[matchedKey]) {
    return alternativesMap[matchedKey];
  }

  return [
    {
      name: `alternative-${packageName}`,
      description: 'Similar functionality package',
      reason: 'Similar features with different implementation',
      similarity: 70,
      trend: 'stable',
      bestFor: 'General use cases',
    },
    {
      name: `${packageName}-lite`,
      description: 'Lightweight alternative',
      reason: 'Smaller bundle size, core features only',
      similarity: 80,
      trend: 'rising',
      bestFor: 'Performance-focused projects',
    },
    {
      name: `modern-${packageName}`,
      description: 'Modern rewrite with latest standards',
      reason: 'Better TypeScript support, modern APIs',
      similarity: 75,
      trend: 'rising',
      bestFor: 'New projects with modern tooling',
    },
  ];
}

export function AIComparisonSuggestions({ packageName }: AIComparisonSuggestionsProps) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  useEffect(() => {
    const generated = generateAlternatives(packageName);
    setAlternatives(generated);
  }, [packageName]);

  if (alternatives.length === 0) {
    return null;
  }

  const trendConfig = {
    rising: { color: 'text-green-500', label: '📈 Rising', bg: 'bg-green-500/10' },
    stable: { color: 'text-blue-500', label: '➡️ Stable', bg: 'bg-blue-500/10' },
    declining: { color: 'text-orange-500', label: '📉 Declining', bg: 'bg-orange-500/10' },
  };

  return (
    <div className="space-y-3 animate-fade-in">{/* Removed glass-card and reduced spacing */}
      {alternatives.map((alt, index) => (
        <div
          key={index}
          className="p-3 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <Link
                    to={`/package/${encodeURIComponent(alt.name)}`}
                    className="font-mono font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {alt.name}
                  </Link>
                  <div className={cn('px-2 py-0.5 rounded text-xs font-medium', trendConfig[alt.trend].bg, trendConfig[alt.trend].color)}>
                    {trendConfig[alt.trend].label}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{alt.description}</p>
                
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Why consider:</span> {alt.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <TrendingUp className="h-3 w-3" />
                  <span>Best for: {alt.bestFor}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Similarity</span>
                      <span className="font-semibold text-primary">{alt.similarity}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${alt.similarity}%` }}
                      />
                    </div>
                  </div>

                  <Link to={`/compare?packages=${encodeURIComponent(packageName)},${encodeURIComponent(alt.name)}`}>
                    <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Compare
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
