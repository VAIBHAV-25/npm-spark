import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectHealthScoreProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Array<{ name: string; impact: number; description: string }>;
}

export function ProjectHealthScore({ score, grade, factors }: ProjectHealthScoreProps) {
  const gradeConfig = {
    A: { color: 'text-green-500', bg: 'bg-green-500', label: 'Excellent', emoji: '🎉' },
    B: { color: 'text-blue-500', bg: 'bg-blue-500', label: 'Good', emoji: '👍' },
    C: { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Fair', emoji: '⚠️' },
    D: { color: 'text-orange-500', bg: 'bg-orange-500', label: 'Poor', emoji: '😟' },
    F: { color: 'text-red-500', bg: 'bg-red-500', label: 'Critical', emoji: '🚨' },
  };

  const config = gradeConfig[grade];

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-3 mb-6">
        <Heart className={cn('h-6 w-6', config.color)} />
        <div>
          <h3 className="text-lg font-semibold">Project Health Score</h3>
          <p className="text-sm text-muted-foreground">AI-calculated dependency health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-lg">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-border"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score / 100) * 352} 352`}
                className={cn('transition-all duration-1000', config.color)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{score}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>

          <div className="text-center">
            <div className={cn('text-3xl font-bold mb-1', config.color)}>
              Grade {grade}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Score Factors:
          </h4>
          {factors.length === 0 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-sm text-green-500">
                Perfect! No issues affecting your score.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {factors.map((factor, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    factor.impact < 0
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-green-500/5 border-green-500/20'
                  )}
                >
                  {factor.impact < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  ) : factor.impact > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold">{factor.name}</span>
                      <span
                        className={cn(
                          'text-xs font-bold',
                          factor.impact < 0 ? 'text-red-500' : 'text-green-500'
                        )}
                      >
                        {factor.impact > 0 ? '+' : ''}
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Health Tips */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3">💡 Tips to Improve Your Score:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {score < 90 && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Keep your dependencies up-to-date to get security patches and bug fixes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Replace deprecated packages with actively maintained alternatives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Review and remove unused dependencies to reduce security surface</span>
              </li>
            </>
          )}
          {score >= 90 && (
            <li className="flex items-start gap-2 text-green-500">
              <span>✓</span>
              <span>Great job! Your dependencies are well-maintained. Keep monitoring for updates.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
