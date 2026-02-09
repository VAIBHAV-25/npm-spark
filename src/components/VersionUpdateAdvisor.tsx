import { NpmPackageDetails } from '@/types/npm';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Zap, Info } from 'lucide-react';
import { formatRelativeDate } from '@/lib/npm-api';

interface VersionUpdateAdvisorProps {
  pkg: NpmPackageDetails;
  currentVersion?: string;
}

interface UpdateAdvice {
  shouldUpdate: boolean;
  urgency: 'critical' | 'high' | 'moderate' | 'low';
  reason: string;
  risks: string[];
  benefits: string[];
  breakingChangeProbability: number;
}

function analyzeVersionUpdate(pkg: NpmPackageDetails, currentVersion?: string): UpdateAdvice {
  const latestVersion = pkg['dist-tags'].latest;
  
  if (!currentVersion || currentVersion === latestVersion) {
    return {
      shouldUpdate: false,
      urgency: 'low',
      reason: 'You are on the latest version',
      risks: [],
      benefits: ['Already up to date with latest features and security patches'],
      breakingChangeProbability: 0,
    };
  }

  const currentVersionParts = currentVersion.split('.').map(Number);
  const latestVersionParts = latestVersion.split('.').map(Number);
  
  const majorDiff = latestVersionParts[0] - currentVersionParts[0];
  const minorDiff = latestVersionParts[1] - currentVersionParts[1];
  const patchDiff = latestVersionParts[2] - currentVersionParts[2];

  let urgency: 'critical' | 'high' | 'moderate' | 'low' = 'low';
  let shouldUpdate = true;
  let reason = '';
  const risks: string[] = [];
  const benefits: string[] = [];
  let breakingChangeProbability = 0;

  const daysSinceLatest = pkg.time?.[latestVersion] 
    ? Math.floor((Date.now() - new Date(pkg.time[latestVersion]).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (majorDiff > 0) {
    urgency = 'moderate';
    reason = `Major version upgrade available (${currentVersion} → ${latestVersion})`;
    risks.push('Breaking changes likely - review migration guide');
    risks.push('May require code refactoring');
    risks.push('Test thoroughly before deploying');
    benefits.push('Access to new features and improvements');
    benefits.push('Long-term support for latest version');
    breakingChangeProbability = 85;
    
    if (majorDiff > 2) {
      urgency = 'high';
      reason = `Multiple major versions behind (${majorDiff} major versions)`;
      risks.push('Very significant changes - migration may be complex');
      breakingChangeProbability = 95;
    }
  } else if (minorDiff > 0) {
    urgency = 'moderate';
    reason = `Minor version update available (${currentVersion} → ${latestVersion})`;
    risks.push('Minimal breaking changes expected');
    benefits.push('New features and enhancements');
    benefits.push('Bug fixes and improvements');
    benefits.push('Backward compatible (typically)');
    breakingChangeProbability = 15;
    
    if (minorDiff > 5) {
      urgency = 'high';
      reason = `Multiple minor versions behind (${minorDiff} minor versions)`;
      risks.push('Accumulation of changes may introduce issues');
      breakingChangeProbability = 30;
    }
  } else if (patchDiff > 0) {
    urgency = 'low';
    reason = `Patch update available (${currentVersion} → ${latestVersion})`;
    risks.push('Very low risk - mainly bug fixes');
    benefits.push('Security patches');
    benefits.push('Bug fixes');
    benefits.push('Performance improvements');
    breakingChangeProbability = 5;
    
    if (daysSinceLatest < 7) {
      urgency = 'moderate';
      benefits.push('Critical security fix (recent release)');
    }
  }

  if (daysSinceLatest > 180) {
    benefits.push('Battle-tested release (6+ months old)');
  } else if (daysSinceLatest < 7) {
    risks.push('Very recent release - wait for community feedback');
  }

  return {
    shouldUpdate,
    urgency,
    reason,
    risks,
    benefits,
    breakingChangeProbability,
  };
}

export function VersionUpdateAdvisor({ pkg, currentVersion }: VersionUpdateAdvisorProps) {
  const latestVersion = pkg['dist-tags'].latest;
  const advice = analyzeVersionUpdate(pkg, currentVersion || latestVersion);

  if (!advice.shouldUpdate) {
    return (
      <div className="glass-card p-4 hover:scale-105 transition-transform animate-fade-in-up">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Up to Date</h4>
            <p className="text-xs text-muted-foreground">You're using the latest version</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Version Update Advisor
        </h4>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          advice.urgency === 'critical' ? 'bg-destructive/20 text-destructive' :
          advice.urgency === 'high' ? 'bg-warning/20 text-warning' :
          advice.urgency === 'moderate' ? 'bg-primary/20 text-primary' :
          'bg-muted text-muted-foreground'
        }`}>
          {advice.urgency.toUpperCase()}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-sm font-medium text-foreground mb-1">{advice.reason}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Breaking change probability: {advice.breakingChangeProbability}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {advice.benefits.length > 0 && (
          <div>
            <p className="text-xs font-medium text-success mb-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Benefits
            </p>
            <ul className="space-y-1">
              {advice.benefits.map((benefit, idx) => (
                <li key={idx} className="text-xs text-muted-foreground pl-4">
                  • {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {advice.risks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-warning mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risks & Considerations
            </p>
            <ul className="space-y-1">
              {advice.risks.map((risk, idx) => (
                <li key={idx} className="text-xs text-muted-foreground pl-4">
                  • {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-start gap-2 text-xs">
          <Info className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground">
            {advice.urgency === 'critical' || advice.urgency === 'high' 
              ? 'Update recommended - Review changelog and test thoroughly'
              : 'Update at your convenience - Low risk'}
          </p>
        </div>
      </div>
    </div>
  );
}
