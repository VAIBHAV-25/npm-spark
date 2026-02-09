import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, XCircle, Shield, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  vulnerable_versions: string;
  patched_versions?: string;
  overview?: string;
  recommendation?: string;
  references?: Array<{ url: string }>;
  cves?: string[];
}

interface SecurityScannerProps {
  packageName: string;
  version?: string;
}

async function fetchVulnerabilities(packageName: string): Promise<Vulnerability[]> {
  try {
    // Using GitHub Advisory Database API (public)
    const response = await fetch(
      `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [packageName]: ['*'] }),
      }
    );

    if (!response.ok) {
      // Fallback: Try to get from npm audit endpoint (limited)
      const fallbackResponse = await fetch(
        `https://registry.npmjs.org/-/npm/v1/security/audits/quick`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'temp-project',
            version: '1.0.0',
            requires: { [packageName]: '*' },
            dependencies: { [packageName]: { version: '*' } },
          }),
        }
      );

      if (!fallbackResponse.ok) return [];
      const data = await fallbackResponse.json();
      return data.advisories ? Object.values(data.advisories) : [];
    }

    const data = await response.json();
    return data[packageName] || [];
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return [];
  }
}

const severityConfig = {
  critical: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Critical',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    label: 'High',
  },
  moderate: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    label: 'Moderate',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Low',
  },
};

export function SecurityScanner({ packageName, version }: SecurityScannerProps) {
  const { data: vulnerabilities, isLoading } = useQuery({
    queryKey: ['vulnerabilities', packageName],
    queryFn: () => fetchVulnerabilities(packageName),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Security Scan</h3>
        </div>
        <p className="text-sm text-muted-foreground">Scanning for vulnerabilities...</p>
      </div>
    );
  }

  const hasVulnerabilities = vulnerabilities && vulnerabilities.length > 0;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Shield className={cn('h-5 w-5', hasVulnerabilities ? 'text-red-500' : 'text-green-500')} />
        <h3 className="text-lg font-semibold">Security Scan</h3>
      </div>

      {!hasVulnerabilities ? (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="font-medium text-green-500">No Known Vulnerabilities</p>
            <p className="text-sm text-muted-foreground mt-1">
              This package has no known security vulnerabilities
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Found {vulnerabilities.length} security {vulnerabilities.length === 1 ? 'issue' : 'issues'}</span>
          </div>

          <div className="space-y-3">
            {vulnerabilities.map((vuln, idx) => {
              const config = severityConfig[vuln.severity];
              const Icon = config.icon;

              return (
                <div
                  key={vuln.id || idx}
                  className={cn(
                    'p-4 rounded-lg border',
                    config.bg,
                    config.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('text-xs font-medium uppercase tracking-wider', config.color)}>
                          {config.label}
                        </span>
                        {vuln.cves && vuln.cves.length > 0 && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {vuln.cves[0]}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-2">{vuln.title}</h4>
                      
                      {vuln.overview && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {vuln.overview}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs">
                        {vuln.vulnerable_versions && (
                          <div>
                            <span className="text-muted-foreground">Affected: </span>
                            <span className="font-mono">{vuln.vulnerable_versions}</span>
                          </div>
                        )}
                        {vuln.patched_versions && (
                          <div>
                            <span className="text-muted-foreground">Fixed in: </span>
                            <span className="font-mono text-green-500">{vuln.patched_versions}</span>
                          </div>
                        )}
                      </div>

                      {vuln.recommendation && (
                        <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                          <p className="text-xs font-medium mb-1">Recommendation</p>
                          <p className="text-xs text-muted-foreground">{vuln.recommendation}</p>
                        </div>
                      )}

                      {vuln.references && vuln.references.length > 0 && (
                        <a
                          href={vuln.references[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
