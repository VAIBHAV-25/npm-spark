import { Lightbulb, CheckCircle } from 'lucide-react';

interface OptimizationSuggestionsProps {
  suggestions: string[];
}

export function OptimizationSuggestions({ suggestions }: OptimizationSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Optimization Suggestions</h3>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-500">
            Your project is well-optimized! No optimization suggestions at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Optimization Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Smart tips to reduce bundle size and improve performance
          </p>
        </div>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
          {suggestions.length} {suggestions.length === 1 ? 'tip' : 'tips'}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
              {idx + 1}
            </div>
            <p className="text-sm text-foreground flex-1">{suggestion}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <span className="font-semibold">Pro Tip:</span> Implementing these suggestions can
          significantly reduce your bundle size, improve load times, and enhance overall application
          performance.
        </p>
      </div>
    </div>
  );
}
