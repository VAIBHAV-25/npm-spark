import { aiPackageSearch, isNaturalLanguageQuery } from '@/lib/ai-search';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, TrendingUp, Package, Loader2, ArrowRight } from 'lucide-react';

interface AISearchResultsProps {
  query: string;
  onPackageSelect?: () => void;
}

export function AISearchResults({ query, onPackageSelect }: AISearchResultsProps) {
  const isNaturalQuery = isNaturalLanguageQuery(query);
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['ai-search', query],
    queryFn: () => aiPackageSearch(query),
    enabled: isNaturalQuery && query.length > 5,
    staleTime: 1000 * 60 * 5,
  });

  if (!isNaturalQuery || query.length <= 5) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-fade-in-up relative z-10 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">AI is analyzing your request...</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up border-2 border-primary/30 relative z-10 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Brain className="h-5 w-5 text-primary" />
          <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI-Powered Recommendations</h3>
          <p className="text-xs text-muted-foreground">Based on your problem description</p>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result, idx) => (
          <Link
            key={result.packageName}
            to={`/package/${encodeURIComponent(result.packageName)}`}
            onClick={onPackageSelect}
            className="block group hover:scale-[1.02] transition-all"
          >
            <div className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-mono text-sm font-semibold text-foreground truncate">
                      {result.packageName}
                    </span>
                    {idx === 0 && (
                      <span className="badge-primary text-xs flex-shrink-0">Top Match</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{result.reason}</p>
                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map(tag => (
                        <span key={tag} className="chip text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`h-3 w-3 ${
                      result.confidence >= 70 ? 'text-success' : 
                      result.confidence >= 50 ? 'text-warning' : 
                      'text-muted-foreground'
                    }`} />
                    <span className={`text-xs font-medium ${
                      result.confidence >= 70 ? 'text-success' : 
                      result.confidence >= 50 ? 'text-warning' : 
                      'text-muted-foreground'
                    }`}>
                      {result.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          Tip: Try describing your problem in natural language like "I need to parse CSV files"
        </p>
      </div>
    </div>
  );
}
