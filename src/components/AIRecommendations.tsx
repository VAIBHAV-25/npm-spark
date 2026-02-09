import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
  Package,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AIRecommendation } from '@/lib/ai-analyzer';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Excellent! No Issues Found</h3>
        <p className="text-muted-foreground">
          Your dependencies are well-maintained and up-to-date. Keep up the good work!
        </p>
      </div>
    );
  }

  const typeConfig = {
    upgrade: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Upgrade' },
    alternative: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Alternative' },
    security: { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Security' },
    performance: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Performance' },
    maintenance: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Maintenance' },
  };

  const severityConfig = {
    high: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    low: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  };

  const highPriority = recommendations.filter(r => r.severity === 'high');
  const mediumPriority = recommendations.filter(r => r.severity === 'medium');
  const lowPriority = recommendations.filter(r => r.severity === 'low');

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Smart suggestions to improve your project's dependencies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="text-lg font-bold text-primary">{recommendations.length}</span>
        </div>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={cn('p-3 rounded-lg border', severityConfig.high.bg, severityConfig.high.border)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">High Priority</span>
            <span className={cn('text-xl font-bold', severityConfig.high.color)}>{highPriority.length}</span>
          </div>
        </div>
        <div className={cn('p-3 rounded-lg border', severityConfig.medium.bg, severityConfig.medium.border)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Medium</span>
            <span className={cn('text-xl font-bold', severityConfig.medium.color)}>{mediumPriority.length}</span>
          </div>
        </div>
        <div className={cn('p-3 rounded-lg border', severityConfig.low.bg, severityConfig.low.border)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Low</span>
            <span className={cn('text-xl font-bold', severityConfig.low.color)}>{lowPriority.length}</span>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const typeConf = typeConfig[rec.type];
          const severityConf = severityConfig[rec.severity];
          const TypeIcon = typeConf.icon;

          return (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border transition-all hover:shadow-lg',
                severityConf.bg,
                severityConf.border
              )}
            >
              <div className="flex items-start gap-3">
                <TypeIcon className={cn('h-5 w-5 shrink-0 mt-0.5', typeConf.color)} />
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/package/${encodeURIComponent(rec.packageName)}`}
                          className="font-mono text-sm font-semibold hover:text-primary hover:underline"
                        >
                          {rec.packageName}
                        </Link>
                        {rec.currentVersion && (
                          <span className="text-xs text-muted-foreground font-mono">
                            v{rec.currentVersion}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs px-2 py-0.5 rounded font-medium', typeConf.bg, typeConf.color)}>
                          {typeConf.label}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded font-medium uppercase', severityConf.bg, severityConf.color)}>
                          {rec.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      💡 {rec.suggestion}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Alternatives */}
                  {rec.alternatives && rec.alternatives.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Recommended Alternatives:
                      </p>
                      <div className="space-y-2">
                        {rec.alternatives.map((alt, altIdx) => (
                          <div
                            key={altIdx}
                            className="flex items-start gap-2 p-2 bg-background/50 rounded"
                          >
                            <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/package/${encodeURIComponent(alt.name)}`}
                                className="font-mono text-xs font-semibold text-primary hover:underline"
                              >
                                {alt.name}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {alt.reason}
                              </p>
                            </div>
                            <Link to={`/package/${encodeURIComponent(alt.name)}`}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
