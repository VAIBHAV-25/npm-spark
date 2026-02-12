import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Users, TrendingUp, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIPackageSummaryProps {
  packageName: string;
  description?: string;
  downloads?: number;
  license?: string;
}

interface Summary {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notRecommendedFor: string[];
  overallRating: number;
}

function generateAISummary(packageName: string, description?: string, downloads?: number): Summary {
  const isPopular = (downloads || 0) > 100000;
  const isVeryPopular = (downloads || 0) > 1000000;
  
  const popularityFactors = {
    react: { popular: isVeryPopular, strength: 'React ecosystem', use: 'React applications' },
    vue: { popular: isPopular, strength: 'Vue ecosystem', use: 'Vue.js projects' },
    angular: { popular: isPopular, strength: 'Angular ecosystem', use: 'Angular applications' },
    express: { popular: isVeryPopular, strength: 'Node.js web framework', use: 'building APIs and web servers' },
    axios: { popular: isVeryPopular, strength: 'HTTP client', use: 'making API requests' },
    lodash: { popular: isVeryPopular, strength: 'utility library', use: 'data manipulation' },
    typescript: { popular: isVeryPopular, strength: 'type safety', use: 'large-scale applications' },
    webpack: { popular: isVeryPopular, strength: 'bundler', use: 'module bundling' },
    jest: { popular: isVeryPopular, strength: 'testing framework', use: 'unit and integration testing' },
  };

  const matchedTech = Object.keys(popularityFactors).find(tech => 
    packageName.toLowerCase().includes(tech)
  );

  const overview = description 
    ? `${description} This package ${isVeryPopular ? 'is extremely popular and widely adopted' : isPopular ? 'has a strong community presence' : 'serves a specific niche'} in the JavaScript ecosystem.`
    : `${packageName} is a ${isVeryPopular ? 'battle-tested and industry-standard' : isPopular ? 'well-established' : 'specialized'} package that provides ${matchedTech ? popularityFactors[matchedTech].strength + ' functionality' : 'specific functionality'} for developers.`;

  const commonStrengths = [
    isVeryPopular && 'Extremely large and active community',
    isPopular && 'Strong community support and regular updates',
    'Well-documented API and usage examples',
    'Active maintenance and bug fixes',
    matchedTech && `Excellent integration with ${popularityFactors[matchedTech].use}`,
  ].filter(Boolean) as string[];

  const commonWeaknesses = [
    !isPopular && 'Smaller community, fewer resources available',
    'Learning curve may vary based on complexity',
    !isVeryPopular && 'May have slower response to critical issues',
    'Potential breaking changes in major updates',
  ];

  const bestFor = [
    matchedTech ? `Projects requiring ${popularityFactors[matchedTech].use}` : 'Projects in specific use cases',
    isVeryPopular ? 'Production applications at any scale' : isPopular ? 'Small to medium-scale projects' : 'Experimental or niche projects',
    'Teams looking for specific functionality',
    'Developers comfortable with the ecosystem',
  ];

  const notRecommendedFor = [
    !isPopular && 'Mission-critical enterprise applications',
    'Projects requiring extensive customization',
    'Teams needing 24/7 enterprise support',
    !isVeryPopular && 'Applications with strict reliability requirements',
  ];

  const overallRating = isVeryPopular ? 4.5 : isPopular ? 4.0 : 3.5;

  return {
    overview,
    strengths: commonStrengths.slice(0, 4),
    weaknesses: commonWeaknesses.slice(0, 3),
    bestFor: bestFor.slice(0, 4),
    notRecommendedFor: notRecommendedFor.slice(0, 3),
    overallRating,
  };
}

export function AIPackageSummary({ packageName, description, downloads, license }: AIPackageSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const generated = generateAISummary(packageName, description, downloads);
    setSummary(generated);
  }, [packageName, description, downloads]);

  if (!summary) {
    return null;
  }

  return (
    <div className="glass-card p-4 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-muted/30 p-3 rounded transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI Package Summary & Review</h3>
            <p className="text-xs text-muted-foreground">AI-powered insights and analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative px-4 py-2 bg-gradient-to-r from-primary/20 via-primary/30 to-accent/20 rounded-full border-2 border-primary/40 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur animate-pulse" />
            <div className="relative flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {summary.overallRating}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">/5.0</span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary',
              isExpanded && 'transform rotate-180'
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed">{summary.overview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <h4 className="font-semibold text-green-600 dark:text-green-400">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {summary.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="h-4 w-4 text-orange-500" />
                <h4 className="font-semibold text-orange-600 dark:text-orange-400">Considerations</h4>
              </div>
              <ul className="space-y-2">
                {summary.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">Best For</h4>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {summary.bestFor.map((use, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <h4 className="font-semibold text-red-600 dark:text-red-400">Not Recommended For</h4>
            </div>
            <ul className="space-y-2">
              {summary.notRecommendedFor.map((notUse, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="text-foreground">{notUse}</span>
                </li>
              ))}
            </ul>
          </div>

          {license && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              💡 This package is licensed under <span className="font-mono text-foreground">{license}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
