import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, ChevronDown, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface VersionDiffProps {
  packageName: string;
  versions: string[];
}

interface ChangeInfo {
  type: 'breaking' | 'feature' | 'fix' | 'other';
  description: string;
}

async function fetchVersionChanges(
  packageName: string,
  fromVersion: string,
  toVersion: string
): Promise<{
  changelog: string | null;
  changes: ChangeInfo[];
  complexity: 'easy' | 'moderate' | 'complex';
}> {
  try {
    // Try to get changelog from GitHub
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    const data = await response.json();
    
    const fromData = data.versions[fromVersion];
    const toData = data.versions[toVersion];

    // Analyze changes between versions
    const changes: ChangeInfo[] = [];
    
    // Check for breaking changes in major version bump
    const fromMajor = parseInt(fromVersion.split('.')[0]);
    const toMajor = parseInt(toVersion.split('.')[0]);
    
    if (toMajor > fromMajor) {
      changes.push({
        type: 'breaking',
        description: `Major version bump from ${fromVersion} to ${toVersion} - may contain breaking changes`,
      });
    }

    // Check dependency changes
    const fromDeps = Object.keys(fromData?.dependencies || {});
    const toDeps = Object.keys(toData?.dependencies || {});
    
    const addedDeps = toDeps.filter(d => !fromDeps.includes(d));
    const removedDeps = fromDeps.filter(d => !toDeps.includes(d));

    if (addedDeps.length > 0) {
      changes.push({
        type: 'feature',
        description: `Added ${addedDeps.length} new ${addedDeps.length === 1 ? 'dependency' : 'dependencies'}`,
      });
    }

    if (removedDeps.length > 0) {
      changes.push({
        type: 'breaking',
        description: `Removed ${removedDeps.length} ${removedDeps.length === 1 ? 'dependency' : 'dependencies'}`,
      });
    }

    // Determine complexity
    let complexity: 'easy' | 'moderate' | 'complex' = 'easy';
    if (toMajor > fromMajor) {
      complexity = 'complex';
    } else if (changes.length > 2) {
      complexity = 'moderate';
    }

    // Try to get changelog URL
    const repoUrl = data.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');
    const changelogUrl = repoUrl 
      ? `${repoUrl}/compare/v${fromVersion}...v${toVersion}`
      : null;

    return {
      changelog: changelogUrl,
      changes,
      complexity,
    };
  } catch (error) {
    console.error('Error fetching version changes:', error);
    return {
      changelog: null,
      changes: [],
      complexity: 'moderate',
    };
  }
}

export function VersionDiff({ packageName, versions }: VersionDiffProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fromVersion, setFromVersion] = useState(versions[1] || versions[0]);
  const [toVersion, setToVersion] = useState(versions[0]);

  const { data: diff, isLoading } = useQuery({
    queryKey: ['version-diff', packageName, fromVersion, toVersion],
    queryFn: () => fetchVersionChanges(packageName, fromVersion, toVersion),
    enabled: isOpen && fromVersion !== toVersion,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (versions.length < 2) return null;

  const complexityConfig = {
    easy: { icon: CheckCircle, color: 'text-green-500', label: 'Easy Migration' },
    moderate: { icon: Info, color: 'text-yellow-500', label: 'Moderate Effort' },
    complex: { icon: AlertTriangle, color: 'text-red-500', label: 'Complex Migration' },
  };

  const changeTypeConfig = {
    breaking: { icon: AlertTriangle, color: 'text-red-500' },
    feature: { icon: CheckCircle, color: 'text-green-500' },
    fix: { icon: CheckCircle, color: 'text-blue-500' },
    other: { icon: Info, color: 'text-gray-500' },
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-0 h-auto hover:bg-transparent group"
      >
        <div className="flex items-center gap-3">
          <GitCompare className="h-5 w-5 text-primary group-hover:text-primary" />
          <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground">Version Comparison</h3>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-foreground group-hover:text-foreground transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Version Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">From Version</label>
              <select
                value={fromVersion}
                onChange={(e) => setFromVersion(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary"
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">To Version</label>
              <select
                value={toVersion}
                onChange={(e) => setToVersion(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary"
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fromVersion === toVersion ? (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Select different versions to compare
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Analyzing changes...
              </p>
            </div>
          ) : diff ? (
            <div className="space-y-4">
              {/* Complexity Badge */}
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-lg border',
                diff.complexity === 'easy' && 'bg-green-500/10 border-green-500/20',
                diff.complexity === 'moderate' && 'bg-yellow-500/10 border-yellow-500/20',
                diff.complexity === 'complex' && 'bg-red-500/10 border-red-500/20'
              )}>
                {(() => {
                  const config = complexityConfig[diff.complexity];
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span className="text-sm font-medium">{config.label}</span>
                    </>
                  );
                })()}
              </div>

              {/* Changes List */}
              {diff.changes.length > 0 ? (
                <div className="space-y-2">
                  {diff.changes.map((change, idx) => {
                    const config = changeTypeConfig[change.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                      >
                        <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.color)} />
                        <p className="text-sm text-muted-foreground">{change.description}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    No specific changes detected. Review changelog for details.
                  </p>
                </div>
              )}

              {/* Changelog Link */}
              {diff.changelog && (
                <a
                  href={diff.changelog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View Full Changelog on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
