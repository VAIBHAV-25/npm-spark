import { NpmPackageDetails, NpmDownloads } from '@/types/npm';
import { Lightbulb, TrendingUp, Shield, Package, Zap, Users, Award, AlertTriangle, CheckCircle2, XCircle, Gauge, GitBranch, Code2, Scale, Clock, TrendingDown, BarChart3 } from 'lucide-react';

interface ComparisonConclusionProps {
  pkg1: NpmPackageDetails;
  pkg2: NpmPackageDetails;
  pkg1Downloads?: NpmDownloads;
  pkg2Downloads?: NpmDownloads;
  pkg1BundleGzip?: number;
  pkg2BundleGzip?: number;
  pkg1Score?: any;
  pkg2Score?: any;
  pkg1Range?: any;
  pkg2Range?: any;
}

interface Criterion {
  name: string;
  pkg1Value: number;
  pkg2Value: number;
  pkg1Display: string;
  pkg2Display: string;
  weight: number;
  winner: 1 | 2 | 'tie';
  icon: any;
}

interface RiskFactor {
  type: 'low' | 'medium' | 'high';
  message: string;
  pkg: 1 | 2;
}

interface Recommendation {
  winner: 1 | 2 | 'tie';
  reason: string;
  confidence: number;
  pkg1Score: number;
  pkg2Score: number;
  pkg1WeightedScore: number;
  pkg2WeightedScore: number;
  criteria: Criterion[];
  pkg1Strengths: string[];
  pkg2Strengths: string[];
  useCases: {
    pkg1: string[];
    pkg2: string[];
  };
  riskFactors: RiskFactor[];
  migrationDifficulty: {
    from1to2: 'easy' | 'moderate' | 'hard';
    from2to1: 'easy' | 'moderate' | 'hard';
  };
  decisionFactors: {
    popularity: 1 | 2 | 'tie';
    performance: 1 | 2 | 'tie';
    maintenance: 1 | 2 | 'tie';
    maturity: 1 | 2 | 'tie';
    community: 1 | 2 | 'tie';
  };
}

function formatDownloads(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function analyzePackages(props: ComparisonConclusionProps): Recommendation {
  const { pkg1, pkg2, pkg1Downloads, pkg2Downloads, pkg1BundleGzip, pkg2BundleGzip, pkg1Score, pkg2Score, pkg1Range, pkg2Range } = props;
  
  const latest1 = pkg1['dist-tags'].latest;
  const latest2 = pkg2['dist-tags'].latest;
  const latestInfo1 = pkg1.versions[latest1];
  const latestInfo2 = pkg2.versions[latest2];
  
  const downloads1 = pkg1Downloads?.downloads || 0;
  const downloads2 = pkg2Downloads?.downloads || 0;
  const deps1Count = Object.keys(latestInfo1?.dependencies || {}).length;
  const deps2Count = Object.keys(latestInfo2?.dependencies || {}).length;
  const versions1Count = Object.keys(pkg1.versions).length;
  const versions2Count = Object.keys(pkg2.versions).length;
  const pkg1Age = pkg1.time?.created ? Date.now() - new Date(pkg1.time.created).getTime() : 0;
  const pkg2Age = pkg2.time?.created ? Date.now() - new Date(pkg2.time.created).getTime() : 0;
  const pkg1LastUpdate = pkg1.time?.[latest1] ? new Date(pkg1.time[latest1]).getTime() : 0;
  const pkg2LastUpdate = pkg2.time?.[latest2] ? new Date(pkg2.time[latest2]).getTime() : 0;
  
  const criteria: Criterion[] = [];
  const pkg1Strengths: string[] = [];
  const pkg2Strengths: string[] = [];
  const riskFactors: RiskFactor[] = [];
  const useCases = { pkg1: [] as string[], pkg2: [] as string[] };
  
  const popularityScore1 = downloads1;
  const popularityScore2 = downloads2;
  const popularityWinner: 1 | 2 | 'tie' = popularityScore1 > popularityScore2 * 1.1 ? 1 : popularityScore2 > popularityScore1 * 1.1 ? 2 : 'tie';
  criteria.push({
    name: 'Weekly Downloads',
    pkg1Value: popularityScore1,
    pkg2Value: popularityScore2,
    pkg1Display: formatDownloads(popularityScore1),
    pkg2Display: formatDownloads(popularityScore2),
    weight: 3,
    winner: popularityWinner,
    icon: TrendingUp,
  });
  
  if (popularityWinner === 1) {
    pkg1Strengths.push(`${Math.round((downloads1 / downloads2) * 100)}% more weekly downloads - strong community adoption`);
  } else if (popularityWinner === 2) {
    pkg2Strengths.push(`${Math.round((downloads2 / downloads1) * 100)}% more weekly downloads - strong community adoption`);
  }
  
  const performanceScore1 = pkg1BundleGzip ? 1 / pkg1BundleGzip : 0;
  const performanceScore2 = pkg2BundleGzip ? 1 / pkg2BundleGzip : 0;
  const performanceWinner: 1 | 2 | 'tie' = performanceScore1 > performanceScore2 * 1.1 ? 1 : performanceScore2 > performanceScore1 * 1.1 ? 2 : 'tie';
  if (pkg1BundleGzip && pkg2BundleGzip) {
    criteria.push({
      name: 'Bundle Size (Gzipped)',
      pkg1Value: pkg1BundleGzip,
      pkg2Value: pkg2BundleGzip,
      pkg1Display: formatBytes(pkg1BundleGzip),
      pkg2Display: formatBytes(pkg2BundleGzip),
      weight: 2.5,
      winner: performanceWinner,
      icon: Zap,
    });
    
    if (performanceWinner === 1) {
      const savings = ((pkg2BundleGzip - pkg1BundleGzip) / pkg2BundleGzip * 100).toFixed(0);
      pkg1Strengths.push(`${savings}% smaller bundle - faster load times & better performance`);
    } else if (performanceWinner === 2) {
      const savings = ((pkg1BundleGzip - pkg2BundleGzip) / pkg1BundleGzip * 100).toFixed(0);
      pkg2Strengths.push(`${savings}% smaller bundle - faster load times & better performance`);
    }
    
    if (pkg1BundleGzip > 200 * 1024) {
      riskFactors.push({
        type: 'medium',
        message: `Large bundle size (${formatBytes(pkg1BundleGzip)}) may impact load performance`,
        pkg: 1,
      });
    }
    if (pkg2BundleGzip > 200 * 1024) {
      riskFactors.push({
        type: 'medium',
        message: `Large bundle size (${formatBytes(pkg2BundleGzip)}) may impact load performance`,
        pkg: 2,
      });
    }
  }
  
  const maintScore1 = pkg1Score?.detail?.maintenance || 0;
  const maintScore2 = pkg2Score?.detail?.maintenance || 0;
  const maintWinner: 1 | 2 | 'tie' = maintScore1 > maintScore2 * 1.05 ? 1 : maintScore2 > maintScore1 * 1.05 ? 2 : 'tie';
  if (maintScore1 && maintScore2) {
    criteria.push({
      name: 'Maintenance Score',
      pkg1Value: maintScore1,
      pkg2Value: maintScore2,
      pkg1Display: `${(maintScore1 * 100).toFixed(0)}%`,
      pkg2Display: `${(maintScore2 * 100).toFixed(0)}%`,
      weight: 2,
      winner: maintWinner,
      icon: Users,
    });
    
    if (maintWinner === 1) {
      pkg1Strengths.push('Higher maintenance score - actively maintained & responsive to issues');
    } else if (maintWinner === 2) {
      pkg2Strengths.push('Higher maintenance score - actively maintained & responsive to issues');
    }
  }
  
  const daysSinceUpdate1 = (Date.now() - pkg1LastUpdate) / (24 * 60 * 60 * 1000);
  const daysSinceUpdate2 = (Date.now() - pkg2LastUpdate) / (24 * 60 * 60 * 1000);
  const freshnessWinner: 1 | 2 | 'tie' = daysSinceUpdate1 < daysSinceUpdate2 * 0.8 ? 1 : daysSinceUpdate2 < daysSinceUpdate1 * 0.8 ? 2 : 'tie';
  criteria.push({
    name: 'Last Updated',
    pkg1Value: -daysSinceUpdate1,
    pkg2Value: -daysSinceUpdate2,
    pkg1Display: daysSinceUpdate1 < 1 ? 'Today' : `${Math.round(daysSinceUpdate1)}d ago`,
    pkg2Display: daysSinceUpdate2 < 1 ? 'Today' : `${Math.round(daysSinceUpdate2)}d ago`,
    weight: 1.5,
    winner: freshnessWinner,
    icon: Clock,
  });
  
  if (daysSinceUpdate1 > 365) {
    riskFactors.push({
      type: 'high',
      message: `Not updated in ${Math.round(daysSinceUpdate1 / 365)} year(s) - may be abandoned`,
      pkg: 1,
    });
  } else if (daysSinceUpdate1 > 180) {
    riskFactors.push({
      type: 'medium',
      message: `No updates in ${Math.round(daysSinceUpdate1)} days - slower maintenance`,
      pkg: 1,
    });
  }
  
  if (daysSinceUpdate2 > 365) {
    riskFactors.push({
      type: 'high',
      message: `Not updated in ${Math.round(daysSinceUpdate2 / 365)} year(s) - may be abandoned`,
      pkg: 2,
    });
  } else if (daysSinceUpdate2 > 180) {
    riskFactors.push({
      type: 'medium',
      message: `No updates in ${Math.round(daysSinceUpdate2)} days - slower maintenance`,
      pkg: 2,
    });
  }
  
  const maturityWinner: 1 | 2 | 'tie' = versions1Count > versions2Count * 1.2 ? 1 : versions2Count > versions1Count * 1.2 ? 2 : 'tie';
  criteria.push({
    name: 'Version History',
    pkg1Value: versions1Count,
    pkg2Value: versions2Count,
    pkg1Display: `${versions1Count} versions`,
    pkg2Display: `${versions2Count} versions`,
    weight: 1,
    winner: maturityWinner,
    icon: GitBranch,
  });
  
  if (maturityWinner === 1) {
    pkg1Strengths.push('Extensive version history indicates maturity & stability');
  } else if (maturityWinner === 2) {
    pkg2Strengths.push('Extensive version history indicates maturity & stability');
  }
  
  const depsWinner: 1 | 2 | 'tie' = deps1Count < deps2Count * 0.8 ? 1 : deps2Count < deps1Count * 0.8 ? 2 : 'tie';
  criteria.push({
    name: 'Dependencies',
    pkg1Value: -deps1Count,
    pkg2Value: -deps2Count,
    pkg1Display: `${deps1Count} deps`,
    pkg2Display: `${deps2Count} deps`,
    weight: 1.5,
    winner: depsWinner,
    icon: Package,
  });
  
  if (depsWinner === 1) {
    pkg1Strengths.push('Fewer dependencies reduce security surface & complexity');
  } else if (depsWinner === 2) {
    pkg2Strengths.push('Fewer dependencies reduce security surface & complexity');
  }
  
  if (deps1Count > 20) {
    riskFactors.push({
      type: 'medium',
      message: `High dependency count (${deps1Count}) increases security & maintenance risk`,
      pkg: 1,
    });
  }
  if (deps2Count > 20) {
    riskFactors.push({
      type: 'medium',
      message: `High dependency count (${deps2Count}) increases security & maintenance risk`,
      pkg: 2,
    });
  }
  
  const hasTS1 = !!latestInfo1?.types || pkg1.name.includes('@types/');
  const hasTS2 = !!latestInfo2?.types || pkg2.name.includes('@types/');
  const tsWinner: 1 | 2 | 'tie' = hasTS1 && !hasTS2 ? 1 : hasTS2 && !hasTS1 ? 2 : 'tie';
  criteria.push({
    name: 'TypeScript Support',
    pkg1Value: hasTS1 ? 1 : 0,
    pkg2Value: hasTS2 ? 1 : 0,
    pkg1Display: hasTS1 ? 'Yes' : 'No',
    pkg2Display: hasTS2 ? 'Yes' : 'No',
    weight: 1,
    winner: tsWinner,
    icon: Code2,
  });
  
  if (tsWinner === 1) {
    pkg1Strengths.push('Built-in TypeScript support for better DX & type safety');
  } else if (tsWinner === 2) {
    pkg2Strengths.push('Built-in TypeScript support for better DX & type safety');
  }
  
  const qualityScore1 = pkg1Score?.detail?.quality || 0;
  const qualityScore2 = pkg2Score?.detail?.quality || 0;
  const qualityWinner: 1 | 2 | 'tie' = qualityScore1 > qualityScore2 * 1.05 ? 1 : qualityScore2 > qualityScore1 * 1.05 ? 2 : 'tie';
  if (qualityScore1 && qualityScore2) {
    criteria.push({
      name: 'Quality Score',
      pkg1Value: qualityScore1,
      pkg2Value: qualityScore2,
      pkg1Display: `${(qualityScore1 * 100).toFixed(0)}%`,
      pkg2Display: `${(qualityScore2 * 100).toFixed(0)}%`,
      weight: 2,
      winner: qualityWinner,
      icon: Award,
    });
    
    if (qualityWinner === 1) {
      pkg1Strengths.push('Higher quality score - better tests, linting & best practices');
    } else if (qualityWinner === 2) {
      pkg2Strengths.push('Higher quality score - better tests, linting & best practices');
    }
  }
  
  let pkg1WeightedScore = 0;
  let pkg2WeightedScore = 0;
  criteria.forEach(c => {
    if (c.winner === 1) pkg1WeightedScore += c.weight;
    else if (c.winner === 2) pkg2WeightedScore += c.weight;
  });
  
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const scoreDiff = Math.abs(pkg1WeightedScore - pkg2WeightedScore);
  const confidence = Math.min(95, Math.round((scoreDiff / totalWeight) * 100));
  
  if (downloads1 > downloads2 * 3) {
    useCases.pkg1.push('Large-scale production apps with proven reliability');
    useCases.pkg2.push('Projects exploring alternatives or niche use cases');
  } else if (downloads2 > downloads1 * 3) {
    useCases.pkg2.push('Large-scale production apps with proven reliability');
    useCases.pkg1.push('Projects exploring alternatives or niche use cases');
  }
  
  if (pkg1BundleGzip && pkg1BundleGzip < 50 * 1024) {
    useCases.pkg1.push('Performance-critical apps with strict bundle budgets');
  }
  if (pkg2BundleGzip && pkg2BundleGzip < 50 * 1024) {
    useCases.pkg2.push('Performance-critical apps with strict bundle budgets');
  }
  
  if (pkg1Age > 2 * 365 * 24 * 60 * 60 * 1000 && versions1Count > 50) {
    useCases.pkg1.push('Enterprise projects needing battle-tested solutions');
  }
  if (pkg2Age > 2 * 365 * 24 * 60 * 60 * 1000 && versions2Count > 50) {
    useCases.pkg2.push('Enterprise projects needing battle-tested solutions');
  }
  
  if (deps1Count < 5) {
    useCases.pkg1.push('Projects prioritizing minimal dependencies');
  }
  if (deps2Count < 5) {
    useCases.pkg2.push('Projects prioritizing minimal dependencies');
  }
  
  if (hasTS1 && daysSinceUpdate1 < 90) {
    useCases.pkg1.push('Modern TypeScript projects with active maintenance');
  }
  if (hasTS2 && daysSinceUpdate2 < 90) {
    useCases.pkg2.push('Modern TypeScript projects with active maintenance');
  }
  
  let winner: 1 | 2 | 'tie' = 'tie';
  let reason = 'Both packages offer comparable features with different trade-offs';
  
  if (pkg1WeightedScore > pkg2WeightedScore * 1.15) {
    winner = 1;
    reason = `${pkg1.name} shows clear advantages across multiple critical factors`;
  } else if (pkg2WeightedScore > pkg1WeightedScore * 1.15) {
    winner = 2;
    reason = `${pkg2.name} shows clear advantages across multiple critical factors`;
  } else if (pkg1WeightedScore > pkg2WeightedScore) {
    winner = 1;
    reason = `${pkg1.name} has a slight edge, but both are solid choices`;
  } else if (pkg2WeightedScore > pkg1WeightedScore) {
    winner = 2;
    reason = `${pkg2.name} has a slight edge, but both are solid choices`;
  }
  
  const migrationDifficulty = {
    from1to2: (Math.abs(deps1Count - deps2Count) > 10 || Math.abs(pkg1Age - pkg2Age) > 3 * 365 * 24 * 60 * 60 * 1000) ? 'hard' : deps1Count > 5 ? 'moderate' : 'easy',
    from2to1: (Math.abs(deps1Count - deps2Count) > 10 || Math.abs(pkg1Age - pkg2Age) > 3 * 365 * 24 * 60 * 60 * 1000) ? 'hard' : deps2Count > 5 ? 'moderate' : 'easy',
  } as const;
  
  return {
    winner,
    reason,
    confidence,
    pkg1Score: Math.round(pkg1WeightedScore * 10),
    pkg2Score: Math.round(pkg2WeightedScore * 10),
    pkg1WeightedScore,
    pkg2WeightedScore,
    criteria,
    pkg1Strengths,
    pkg2Strengths,
    useCases,
    riskFactors,
    migrationDifficulty,
    decisionFactors: {
      popularity: popularityWinner,
      performance: performanceWinner,
      maintenance: maintWinner,
      maturity: maturityWinner,
      community: popularityWinner,
    },
  };
}

export function ComparisonConclusion(props: ComparisonConclusionProps) {
  const recommendation = analyzePackages(props);
  const { pkg1, pkg2 } = props;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up animation-delay-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-foreground">AI-Powered Smart Recommendation</h3>
        </div>
        {recommendation.winner !== 'tie' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {recommendation.confidence}% Confidence
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className={`${recommendation.winner === 'tie' ? 'bg-muted/30 border-muted' : 'bg-primary/10 border-primary/30'} border rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Final Verdict</h4>
              <p className="text-muted-foreground mb-3">{recommendation.reason}</p>
              {recommendation.winner !== 'tie' && (
                <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <p className="text-primary font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Recommended: <span className="font-mono text-lg">{recommendation.winner === 1 ? pkg1.name : pkg2.name}</span>
                  </p>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{recommendation.winner === 1 ? recommendation.pkg1Score : recommendation.pkg2Score}</div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              )}
              {recommendation.winner === 'tie' && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  <span className="text-sm">Scores: {pkg1.name} ({recommendation.pkg1Score}) vs {pkg2.name} ({recommendation.pkg2Score})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Detailed Comparison Matrix
          </h4>
          <div className="space-y-2">
            {recommendation.criteria.map((criterion, idx) => {
              const Icon = criterion.icon;
              return (
                <div key={idx} className="bg-muted/20 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{criterion.name}</span>
                      <span className="text-xs text-muted-foreground">({criterion.weight}x weight)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {criterion.winner === 1 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {criterion.winner === 2 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {criterion.winner === 'tie' && <span className="text-xs text-muted-foreground">Tie</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`text-sm ${criterion.winner === 1 ? 'text-green-500 font-semibold' : 'text-muted-foreground'}`}>
                      {pkg1.name}: {criterion.pkg1Display}
                    </div>
                    <div className={`text-sm ${criterion.winner === 2 ? 'text-green-500 font-semibold' : 'text-muted-foreground'}`}>
                      {pkg2.name}: {criterion.pkg2Display}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {recommendation.riskFactors.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Risk Assessment
            </h4>
            <div className="space-y-2">
              {recommendation.riskFactors.map((risk, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${getRiskColor(risk.type)}`}>
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase">{risk.type} Risk</span>
                      <span className="text-xs px-2 py-0.5 bg-background/50 rounded font-mono">
                        {risk.pkg === 1 ? pkg1.name : pkg2.name}
                      </span>
                    </div>
                    <p className="text-sm">{risk.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {pkg1.name}
              </h4>
              <span className="text-sm font-mono px-3 py-1 bg-primary/10 text-primary rounded-full">
                Score: {recommendation.pkg1Score}
              </span>
            </div>
            
            {recommendation.pkg1Strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground font-semibold">Key Strengths</p>
                {recommendation.pkg1Strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm bg-green-500/5 p-2 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Ideal Use Cases
              </p>
              {recommendation.useCases.pkg1.map((useCase, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-2.5 text-sm text-foreground border border-border/50">
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
              <span className="text-sm font-mono px-3 py-1 bg-accent/10 text-accent rounded-full">
                Score: {recommendation.pkg2Score}
              </span>
            </div>
            
            {recommendation.pkg2Strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground font-semibold">Key Strengths</p>
                {recommendation.pkg2Strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm bg-green-500/5 p-2 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Ideal Use Cases
              </p>
              {recommendation.useCases.pkg2.map((useCase, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-2.5 text-sm text-foreground border border-border/50">
                  • {useCase}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/20 border border-border rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Migration Difficulty Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">From {pkg1.name} → {pkg2.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold capitalize ${getDifficultyColor(recommendation.migrationDifficulty.from1to2)}`}>
                  {recommendation.migrationDifficulty.from1to2}
                </span>
                {recommendation.migrationDifficulty.from1to2 === 'easy' && <span className="text-xs text-muted-foreground">Low effort required</span>}
                {recommendation.migrationDifficulty.from1to2 === 'moderate' && <span className="text-xs text-muted-foreground">Some refactoring needed</span>}
                {recommendation.migrationDifficulty.from1to2 === 'hard' && <span className="text-xs text-muted-foreground">Significant changes required</span>}
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">From {pkg2.name} → {pkg1.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold capitalize ${getDifficultyColor(recommendation.migrationDifficulty.from2to1)}`}>
                  {recommendation.migrationDifficulty.from2to1}
                </span>
                {recommendation.migrationDifficulty.from2to1 === 'easy' && <span className="text-xs text-muted-foreground">Low effort required</span>}
                {recommendation.migrationDifficulty.from2to1 === 'moderate' && <span className="text-xs text-muted-foreground">Some refactoring needed</span>}
                {recommendation.migrationDifficulty.from2to1 === 'hard' && <span className="text-xs text-muted-foreground">Significant changes required</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-500/5 p-3 rounded-lg border border-blue-500/20">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <p>
              <span className="font-medium text-foreground">Pro Tip:</span> This AI-powered analysis considers {recommendation.criteria.length} factors with weighted scoring. 
              Always validate with your specific requirements, test in your environment, check GitHub activity, read recent issues, and review documentation before making your final decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
