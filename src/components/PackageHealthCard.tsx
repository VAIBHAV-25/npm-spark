import { NpmPackageDetails, NpmSearchResult } from '@/types/npm';
import { Shield, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { formatRelativeDate } from '@/lib/npm-api';

interface PackageHealthCardProps {
  pkg: NpmPackageDetails;
  score?: NpmSearchResult | null;
}

interface HealthCheck {
  status: 'good' | 'warning' | 'critical' | 'info';
  label: string;
  message: string;
  icon: typeof CheckCircle;
}

function analyzePackageHealth(pkg: NpmPackageDetails, score?: NpmSearchResult | null): HealthCheck[] {
  const checks: HealthCheck[] = [];
  const latest = pkg['dist-tags'].latest;
  const latestInfo = pkg.versions[latest];
  
  const lastPublishTime = pkg.time?.[latest] ? new Date(pkg.time[latest]).getTime() : 0;
  const daysSinceUpdate = Math.floor((Date.now() - lastPublishTime) / (1000 * 60 * 60 * 24));
  
  if (daysSinceUpdate < 90) {
    checks.push({
      status: 'good',
      label: 'Recently Updated',
      message: `Last published ${formatRelativeDate(pkg.time[latest])}`,
      icon: CheckCircle,
    });
  } else if (daysSinceUpdate < 365) {
    checks.push({
      status: 'info',
      label: 'Moderate Activity',
      message: `Last update was ${formatRelativeDate(pkg.time[latest])}`,
      icon: Info,
    });
  } else {
    checks.push({
      status: 'warning',
      label: 'Stale Package',
      message: `No updates for ${Math.floor(daysSinceUpdate / 365)} year(s)`,
      icon: AlertTriangle,
    });
  }
  
  const hasTypes = Boolean(latestInfo?.types || (latestInfo as any)?.typings);
  if (hasTypes) {
    checks.push({
      status: 'good',
      label: 'TypeScript Support',
      message: 'Includes type definitions for better DX',
      icon: CheckCircle,
    });
  }
  
  const depsCount = Object.keys(latestInfo?.dependencies || {}).length;
  if (depsCount === 0) {
    checks.push({
      status: 'good',
      label: 'Zero Dependencies',
      message: 'No external dependencies - lower security risk',
      icon: CheckCircle,
    });
  } else if (depsCount < 5) {
    checks.push({
      status: 'good',
      label: 'Minimal Dependencies',
      message: `Only ${depsCount} dependencies`,
      icon: CheckCircle,
    });
  } else if (depsCount > 20) {
    checks.push({
      status: 'warning',
      label: 'Many Dependencies',
      message: `${depsCount} dependencies may increase security surface`,
      icon: AlertTriangle,
    });
  }
  
  if (pkg.license) {
    const popularLicenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'];
    if (popularLicenses.includes(pkg.license)) {
      checks.push({
        status: 'good',
        label: 'Open Source License',
        message: `${pkg.license} - permissive and widely accepted`,
        icon: CheckCircle,
      });
    } else {
      checks.push({
        status: 'info',
        label: 'License Review',
        message: `${pkg.license} - review license terms`,
        icon: Info,
      });
    }
  } else {
    checks.push({
      status: 'warning',
      label: 'No License',
      message: 'Missing license information',
      icon: AlertTriangle,
    });
  }
  
  if (score?.score) {
    const quality = score.score.detail.quality * 100;
    const maintenance = score.score.detail.maintenance * 100;
    
    if (quality >= 70 && maintenance >= 70) {
      checks.push({
        status: 'good',
        label: 'High Quality Score',
        message: `Quality: ${quality.toFixed(0)}% | Maintenance: ${maintenance.toFixed(0)}%`,
        icon: TrendingUp,
      });
    } else if (quality < 50 || maintenance < 50) {
      checks.push({
        status: 'warning',
        label: 'Quality Concerns',
        message: `Quality: ${quality.toFixed(0)}% | Maintenance: ${maintenance.toFixed(0)}%`,
        icon: AlertTriangle,
      });
    }
  }
  
  const versions = Object.keys(pkg.versions);
  if (versions.length > 50) {
    checks.push({
      status: 'good',
      label: 'Mature Package',
      message: `${versions.length} versions show long-term support`,
      icon: CheckCircle,
    });
  }
  
  return checks;
}

export function PackageHealthCard({ pkg, score }: PackageHealthCardProps) {
  const healthChecks = analyzePackageHealth(pkg, score);
  
  const goodCount = healthChecks.filter(c => c.status === 'good').length;
  const warningCount = healthChecks.filter(c => c.status === 'warning').length;
  const criticalCount = healthChecks.filter(c => c.status === 'critical').length;
  
  const overallHealth = criticalCount > 0 ? 'critical' : warningCount > goodCount ? 'warning' : 'good';

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Shield className={`h-4 w-4 ${
            overallHealth === 'good' ? 'text-success' : 
            overallHealth === 'warning' ? 'text-warning' : 
            'text-destructive'
          }`} />
          Package Health
        </h4>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          overallHealth === 'good' ? 'bg-success/20 text-success' : 
          overallHealth === 'warning' ? 'bg-warning/20 text-warning' : 
          'bg-destructive/20 text-destructive'
        }`}>
          {overallHealth === 'good' ? '✓ Healthy' : overallHealth === 'warning' ? '⚠ Review' : '⚠ Critical'}
        </div>
      </div>
      
      <div className="space-y-2">
        {healthChecks.map((check, idx) => {
          const Icon = check.icon;
          return (
            <div key={idx} className="flex items-start gap-2 text-sm hover:bg-muted/20 p-2 rounded-lg transition-colors">
              <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                check.status === 'good' ? 'text-success' : 
                check.status === 'warning' ? 'text-warning' : 
                check.status === 'critical' ? 'text-destructive' : 
                'text-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          Based on automated analysis. Always review package source and community feedback.
        </p>
      </div>
    </div>
  );
}
