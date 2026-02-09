import { NpmPackageDetails, NpmDownloads } from '@/types/npm';
import { Lightbulb, TrendingUp, Shield, Package, Zap, Users, Award } from 'lucide-react';

interface ComparisonConclusionProps {
  pkg1: NpmPackageDetails;
  pkg2: NpmPackageDetails;
  pkg1Downloads?: NpmDownloads;
  pkg2Downloads?: NpmDownloads;
  pkg1BundleGzip?: number;
  pkg2BundleGzip?: number;
}

interface Recommendation {
  winner: 1 | 2 | 'tie';
  reason: string;
  pkg1Score: number;
  pkg2Score: number;
  pkg1Strengths: string[];
  pkg2Strengths: string[];
  useCases: {
    pkg1: string[];
    pkg2: string[];
  };
}

function analyzePackages(props: ComparisonConclusionProps): Recommendation {
  const { pkg1, pkg2, pkg1Downloads, pkg2Downloads, pkg1BundleGzip, pkg2BundleGzip } = props;
  
  let pkg1Score = 0;
  let pkg2Score = 0;
  const pkg1Strengths: string[] = [];
  const pkg2Strengths: string[] = [];
  
  const latest1 = pkg1['dist-tags'].latest;
  const latest2 = pkg2['dist-tags'].latest;
  const latestInfo1 = pkg1.versions[latest1];
  const latestInfo2 = pkg2.versions[latest2];
  
  const downloads1 = pkg1Downloads?.downloads || 0;
  const downloads2 = pkg2Downloads?.downloads || 0;
  if (downloads1 > downloads2 * 1.5) {
    pkg1Score += 2;
    pkg1Strengths.push('Higher download numbers indicate strong community adoption');
  } else if (downloads2 > downloads1 * 1.5) {
    pkg2Score += 2;
    pkg2Strengths.push('Higher download numbers indicate strong community adoption');
  }
  
  if (pkg1BundleGzip && pkg2BundleGzip) {
    if (pkg1BundleGzip < pkg2BundleGzip * 0.7) {
      pkg1Score += 2;
      pkg1Strengths.push('Significantly smaller bundle size improves load performance');
    } else if (pkg2BundleGzip < pkg1BundleGzip * 0.7) {
      pkg2Score += 2;
      pkg2Strengths.push('Significantly smaller bundle size improves load performance');
    }
  }
  
  const versions1Count = Object.keys(pkg1.versions).length;
  const versions2Count = Object.keys(pkg2.versions).length;
  const pkg1Age = pkg1.time?.created ? Date.now() - new Date(pkg1.time.created).getTime() : 0;
  const pkg2Age = pkg2.time?.created ? Date.now() - new Date(pkg2.time.created).getTime() : 0;
  
  if (pkg1Age > pkg2Age * 1.5 && versions1Count > versions2Count * 1.2) {
    pkg1Score += 1;
    pkg1Strengths.push('More mature with extensive version history');
  } else if (pkg2Age > pkg1Age * 1.5 && versions2Count > versions1Count * 1.2) {
    pkg2Score += 1;
    pkg2Strengths.push('More mature with extensive version history');
  }
  
  const pkg1LastUpdate = pkg1.time?.[latest1] ? new Date(pkg1.time[latest1]).getTime() : 0;
  const pkg2LastUpdate = pkg2.time?.[latest2] ? new Date(pkg2.time[latest2]).getTime() : 0;
  const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
  
  if (pkg1LastUpdate > sixMonthsAgo && pkg1LastUpdate > pkg2LastUpdate) {
    pkg1Score += 1;
    pkg1Strengths.push('Recently updated, actively maintained');
  } else if (pkg2LastUpdate > sixMonthsAgo && pkg2LastUpdate > pkg1LastUpdate) {
    pkg2Score += 1;
    pkg2Strengths.push('Recently updated, actively maintained');
  }
  
  const deps1Count = Object.keys(latestInfo1?.dependencies || {}).length;
  const deps2Count = Object.keys(latestInfo2?.dependencies || {}).length;
  
  if (deps1Count < deps2Count * 0.5 && deps1Count < 5) {
    pkg1Score += 1;
    pkg1Strengths.push('Fewer dependencies reduce security risks and complexity');
  } else if (deps2Count < deps1Count * 0.5 && deps2Count < 5) {
    pkg2Score += 1;
    pkg2Strengths.push('Fewer dependencies reduce security risks and complexity');
  }
  
  const useCases = {
    pkg1: [] as string[],
    pkg2: [] as string[],
  };
  
  if (downloads1 > downloads2 * 2) {
    useCases.pkg1.push('Large-scale production applications with proven track record');
    useCases.pkg2.push('Projects seeking lighter alternatives or newer approaches');
  } else if (downloads2 > downloads1 * 2) {
    useCases.pkg2.push('Large-scale production applications with proven track record');
    useCases.pkg1.push('Projects seeking lighter alternatives or newer approaches');
  } else {
    useCases.pkg1.push('Projects where this package\'s specific features are needed');
    useCases.pkg2.push('Projects where this package\'s specific features are needed');
  }
  
  if (pkg1BundleGzip && pkg1BundleGzip < 50 * 1024) {
    useCases.pkg1.push('Performance-critical applications with strict bundle size limits');
  }
  if (pkg2BundleGzip && pkg2BundleGzip < 50 * 1024) {
    useCases.pkg2.push('Performance-critical applications with strict bundle size limits');
  }
  
  if (pkg1Age > 2 * 365 * 24 * 60 * 60 * 1000) {
    useCases.pkg1.push('Enterprise projects requiring battle-tested solutions');
  }
  if (pkg2Age > 2 * 365 * 24 * 60 * 60 * 1000) {
    useCases.pkg2.push('Enterprise projects requiring battle-tested solutions');
  }
  
  if (deps1Count < 3) {
    useCases.pkg1.push('Projects prioritizing minimal dependency trees');
  }
  if (deps2Count < 3) {
    useCases.pkg2.push('Projects prioritizing minimal dependency trees');
  }
  
  let winner: 1 | 2 | 'tie' = 'tie';
  let reason = 'Both packages are solid choices with different trade-offs';
  
  if (pkg1Score > pkg2Score + 1) {
    winner = 1;
    reason = `${pkg1.name} has a clear advantage in multiple areas`;
  } else if (pkg2Score > pkg1Score + 1) {
    winner = 2;
    reason = `${pkg2.name} has a clear advantage in multiple areas`;
  }
  
  return {
    winner,
    reason,
    pkg1Score,
    pkg2Score,
    pkg1Strengths,
    pkg2Strengths,
    useCases,
  };
}

export function ComparisonConclusion(props: ComparisonConclusionProps) {
  const recommendation = analyzePackages(props);
  const { pkg1, pkg2 } = props;

  return (
    <div className="glass-card p-6 animate-fade-in-up animation-delay-800">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-foreground">Smart Recommendation</h3>
      </div>

      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Verdict</h4>
              <p className="text-muted-foreground">{recommendation.reason}</p>
              {recommendation.winner !== 'tie' && (
                <p className="text-primary font-medium mt-2">
                  → Recommended: <span className="font-mono">{recommendation.winner === 1 ? pkg1.name : pkg2.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {pkg1.name}
              </h4>
              <span className="text-sm font-mono text-muted-foreground">Score: {recommendation.pkg1Score}</span>
            </div>
            
            {recommendation.pkg1Strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Strengths</p>
                {recommendation.pkg1Strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Best For
              </p>
              {recommendation.useCases.pkg1.map((useCase, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-2 text-sm text-foreground">
                  • {useCase}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                {pkg2.name}
              </h4>
              <span className="text-sm font-mono text-muted-foreground">Score: {recommendation.pkg2Score}</span>
            </div>
            
            {recommendation.pkg2Strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Strengths</p>
                {recommendation.pkg2Strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Best For
              </p>
              {recommendation.useCases.pkg2.map((useCase, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-2 text-sm text-foreground">
                  • {useCase}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-medium text-foreground">Pro Tip:</span> Always consider your specific use case, team expertise, and project requirements. 
              Check GitHub activity, read recent issues, and review the documentation before making your final decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
