import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GitCompare,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  ArrowRight,
  Package,
  Code,
  Wrench,
  Clock,
  Shield,
  Zap,
  FileCode,
  AlertCircle,
  Lightbulb,
  Terminal,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  generateDetailedBreakingChanges,
  generateCodeMigrationExamples,
  generateDetailedCommonIssues,
  generateDetailedMigrationSteps,
  generateDependencyUpdates,
  generateTestingStrategy,
  hasPackageKnowledge,
} from '@/lib/migration-ai';

interface VersionDiffProps {
  packageName: string;
  versions: string[];
}

interface ChangeInfo {
  type: 'breaking' | 'feature' | 'fix' | 'other';
  description: string;
}

interface DependencyUpdate {
  name: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  critical: boolean;
}

interface MigrationStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  warning?: string;
}

interface MigrationGuide {
  estimatedTime: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  breakingChanges: string[];
  dependencyUpdates: DependencyUpdate[];
  steps: MigrationStep[];
  codeChanges: Array<{ before: string; after: string; reason: string }>;
  commonIssues: Array<{ issue: string; solution: string }>;
  rollbackStrategy: string;
  testingRecommendations: string[];
}

interface PackageVersionData {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

async function generateMigrationGuide(
  packageName: string,
  fromVersion: string,
  toVersion: string,
  fromData: PackageVersionData,
  toData: PackageVersionData
): Promise<MigrationGuide> {
  const fromMajor = parseInt(fromVersion.split('.')[0]);
  const toMajor = parseInt(toVersion.split('.')[0]);
  const fromMinor = parseInt(fromVersion.split('.')[1]);
  const toMinor = parseInt(toVersion.split('.')[1]);
  
  const majorDiff = toMajor - fromMajor;
  const minorDiff = toMinor - fromMinor;

  // Determine difficulty
  let difficulty: 'easy' | 'moderate' | 'hard' = 'easy';
  if (majorDiff > 2) difficulty = 'hard';
  else if (majorDiff > 0) difficulty = 'moderate';
  else if (minorDiff > 5) difficulty = 'moderate';

  // Estimated time
  let estimatedTime = '15-30 minutes';
  if (difficulty === 'hard') estimatedTime = '2-4 hours';
  else if (difficulty === 'moderate') estimatedTime = '1-2 hours';

  // Analyze dependency changes
  const fromDeps = fromData?.dependencies || {};
  const toDeps = toData?.dependencies || {};
  const dependencyUpdates: DependencyUpdate[] = [];

  Object.keys(toDeps).forEach(dep => {
    if (fromDeps[dep] && fromDeps[dep] !== toDeps[dep]) {
      dependencyUpdates.push({
        name: dep,
        fromVersion: fromDeps[dep],
        toVersion: toDeps[dep],
        reason: 'Required for compatibility with new version',
        critical: majorDiff > 0,
      });
    } else if (!fromDeps[dep]) {
      dependencyUpdates.push({
        name: dep,
        fromVersion: 'Not installed',
        toVersion: toDeps[dep],
        reason: 'New dependency added in this version',
        critical: false,
      });
    }
  });

  Object.keys(fromDeps).forEach(dep => {
    if (!toDeps[dep]) {
      dependencyUpdates.push({
        name: dep,
        fromVersion: fromDeps[dep],
        toVersion: 'Removed',
        reason: 'No longer needed or replaced',
        critical: true,
      });
    }
  });

  // Generate AI-powered detailed breaking changes
  const breakingChanges = generateDetailedBreakingChanges(packageName, fromMajor, toMajor);
  
  if (dependencyUpdates.some(d => d.toVersion === 'Removed')) {
    breakingChanges.push('⚠️ Dependencies were removed - may affect functionality');
  }

  // Add AI-generated dependency update requirements
  const aiDependencyUpdates = generateDependencyUpdates(packageName, fromMajor, toMajor);
  aiDependencyUpdates.forEach(({ dep, reason, critical }) => {
    if (critical && !breakingChanges.some(bc => bc.includes(dep))) {
      breakingChanges.push(`${dep} must be updated - ${reason}`);
    }
  });

  // Generate AI-powered detailed migration steps
  const aiSteps = generateDetailedMigrationSteps(packageName, fromMajor, toMajor, toVersion);
  
  const steps: MigrationStep[] = [
    {
      step: 1,
      title: '🔒 Create Backup Branch',
      description: 'Create a backup of your current project state before upgrading. This allows easy rollback if needed.',
      code: `git checkout -b upgrade-${packageName.replace(/[@/]/g, '-')}-v${toVersion}\ngit add .\ngit commit -m "Before ${packageName} upgrade"`,
      warning: majorDiff > 1 ? 'CRITICAL: This is a multi-major version upgrade. Consider migrating incrementally.' : 'Always work on a separate branch for major upgrades',
    },
    {
      step: 2,
      title: '📚 Review Official Documentation',
      description: `Read the official changelog and migration guide for ${packageName} covering versions ${fromVersion} → ${toVersion}`,
      code: `# Check package information\nnpm view ${packageName}@${toVersion}\n\n# Visit package homepage\nnpm home ${packageName}`,
    },
    {
      step: 3,
      title: '🔍 Identify Breaking Changes',
      description: `Analyze your codebase to identify areas affected by breaking changes. Found ${breakingChanges.length} potential breaking changes.`,
      code: `# Search for package usage in your code\ngrep -r "${packageName}" src/\n\n# Or use your IDE's search feature`,
      warning: breakingChanges.length > 5 ? 'High number of breaking changes detected - thorough testing required' : undefined,
    },
  ];

  // Add AI-generated custom steps
  aiSteps.forEach((stepDesc, index) => {
    steps.push({
      step: steps.length + 1,
      title: `📝 ${stepDesc}`,
      description: `Important migration task based on ${packageName} best practices`,
    });
  });

  steps.push(
    {
      step: steps.length + 1,
      title: '📦 Update Main Package',
      description: `Upgrade ${packageName} to version ${toVersion}`,
      code: `npm install ${packageName}@${toVersion}\n\n# Or with yarn\nyarn add ${packageName}@${toVersion}`,
    },
  );

  if (dependencyUpdates.length > 0) {
    steps.push({
      step: 4,
      title: 'Update Related Dependencies',
      description: `${dependencyUpdates.length} ${dependencyUpdates.length === 1 ? 'dependency needs' : 'dependencies need'} to be updated for compatibility`,
      code: dependencyUpdates
        .filter(d => d.toVersion !== 'Removed')
        .slice(0, 3)
        .map(d => `npm install ${d.name}@${d.toVersion}`)
        .join('\n'),
      warning: dependencyUpdates.some(d => d.critical) ? 'Some updates are critical for functionality' : undefined,
    });
  }

  steps.push(
    {
      step: steps.length + 1,
      title: '✅ Run Full Test Suite',
      description: 'Execute your test suite to catch any breaking changes. This is critical to ensure stability.',
      code: `npm test\n\n# Run with coverage\nnpm test -- --coverage\n\n# Or with specific test runner\nnpx jest\nnpx vitest`,
      warning: majorDiff > 1 ? 'CRITICAL: With multi-major upgrades, expect test failures. Fix them before proceeding.' : 'Address all failing tests before proceeding',
    },
    {
      step: steps.length + 2,
      title: '📘 Update TypeScript Definitions',
      description: 'If using TypeScript, update type definitions to match the new version',
      code: `npm install --save-dev @types/${packageName}@latest\n\n# Check TypeScript compilation\nnpx tsc --noEmit`,
    },
    {
      step: steps.length + 3,
      title: '🔍 Lint and Fix Code',
      description: 'Run linter to catch API usage issues and deprecated patterns',
      code: `npm run lint\n\n# Auto-fix what's possible\nnpm run lint -- --fix`,
    },
    {
      step: steps.length + 4,
      title: '🧪 Test in Development Mode',
      description: 'Thoroughly test your application in development mode with all features',
      code: 'npm run dev\n\n# Check browser console for errors and warnings',
      warning: 'Test all major user flows manually',
    },
    {
      step: steps.length + 5,
      title: '🔐 Security & Dependency Audit',
      description: 'Ensure no security vulnerabilities and check for peer dependency conflicts',
      code: `npm audit\nnpm audit fix\n\n# Check for conflicts\nnpm ls ${packageName}`,
    },
    {
      step: steps.length + 6,
      title: '📦 Build Production Bundle',
      description: 'Test production build to catch build-time errors',
      code: 'npm run build\n\n# Check bundle size\nnpm run build -- --analyze',
      warning: majorDiff > 0 ? 'Check for bundle size increases' : undefined,
    },
    {
      step: steps.length + 7,
      title: '📝 Update Documentation',
      description: 'Update your project documentation, README, and CHANGELOG with version changes',
    },
    {
      step: steps.length + 8,
      title: '🚀 Deploy to Staging',
      description: 'Deploy to staging environment for final validation before production',
      warning: 'Monitor error tracking and performance metrics in staging',
    }
  );

  // AI-powered code migration examples
  const codeChanges = generateCodeMigrationExamples(packageName, fromMajor, toMajor);
  
  if (codeChanges.length === 0 && majorDiff > 0) {
    // Fallback generic example
    codeChanges.push({
      before: `// Old API (v${fromVersion})\nimport ${packageName.includes('/') ? '{ Component }' : packageName.split('/').pop()} from '${packageName}';\n\n// Old usage patterns may differ`,
      after: `// New API (v${toVersion})\nimport ${packageName.includes('/') ? '{ Component }' : packageName.split('/').pop()} from '${packageName}';\n\n// Check official docs for new patterns`,
      reason: `Major version ${toMajor} may have restructured exports or changed APIs. Review the official migration guide for specific changes.`,
    });
  }

  // AI-powered common issues with detailed solutions
  const commonIssues = generateDetailedCommonIssues(packageName, fromMajor, toMajor, fromVersion, toVersion);

  // AI-powered testing recommendations
  const testingRecommendations = generateTestingStrategy(majorDiff);

  // Enhanced rollback strategy
  const rollbackStrategy = majorDiff > 1
    ? `# EMERGENCY ROLLBACK (Multi-major upgrade)\n# 1. Revert to backup branch\ngit checkout main  # or your previous branch\n\n# 2. Or reset to previous commit\ngit log --oneline -5  # Find your backup commit\ngit reset --hard <commit-hash>\n\n# 3. Reinstall original dependencies\nrm -rf node_modules package-lock.json\ngit checkout -- package.json package-lock.json\nnpm install\n\n# 4. Verify everything works\nnpm test && npm run dev`
    : `# Quick Rollback\n# 1. Revert package changes\ngit checkout -- package.json package-lock.json\nnpm install\n\n# 2. Or use git reset\ngit reset --hard HEAD~1\nnpm install\n\n# 3. Verify rollback\nnpm test`;

  return {
    estimatedTime,
    difficulty,
    breakingChanges,
    dependencyUpdates,
    steps,
    codeChanges,
    commonIssues,
    rollbackStrategy,
    testingRecommendations,
  };
}

async function fetchVersionChanges(
  packageName: string,
  fromVersion: string,
  toVersion: string
): Promise<{
  changelog: string | null;
  changes: ChangeInfo[];
  complexity: 'easy' | 'moderate' | 'complex';
  migrationGuide: MigrationGuide | null;
}> {
  try {
    console.log(`Fetching version data for ${packageName}: ${fromVersion} → ${toVersion}`);
    
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    
    if (!response.ok) {
      throw new Error(`NPM Registry returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.versions) {
      throw new Error('No versions data found in package');
    }
    
    const fromData = data.versions[fromVersion];
    const toData = data.versions[toVersion];

    if (!fromData) {
      throw new Error(`Version ${fromVersion} not found in registry`);
    }
    
    if (!toData) {
      throw new Error(`Version ${toVersion} not found in registry`);
    }

    console.log(`Successfully fetched data for ${fromVersion} and ${toVersion}`);

    const changes: ChangeInfo[] = [];
    
    const fromMajor = parseInt(fromVersion.split('.')[0]);
    const toMajor = parseInt(toVersion.split('.')[0]);
    
    if (toMajor > fromMajor) {
      changes.push({
        type: 'breaking',
        description: `Major version bump from ${fromVersion} to ${toVersion} - may contain breaking changes`,
      });
    }

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

    let complexity: 'easy' | 'moderate' | 'complex' = 'easy';
    if (toMajor > fromMajor) {
      complexity = 'complex';
    } else if (changes.length > 2) {
      complexity = 'moderate';
    }

    const repoUrl = data.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');
    const changelogUrl = repoUrl 
      ? `${repoUrl}/compare/v${fromVersion}...v${toVersion}`
      : null;

    // Generate comprehensive migration guide
    const migrationGuide = await generateMigrationGuide(
      packageName,
      fromVersion,
      toVersion,
      fromData,
      toData
    );

    console.log('Migration guide generated successfully');
    
    return {
      changelog: changelogUrl,
      changes,
      complexity,
      migrationGuide,
    };
  } catch (error) {
    console.error('Error fetching version changes:', error);
    console.error('Error details:', {
      packageName,
      fromVersion,
      toVersion,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error; // Re-throw so React Query can handle it properly
  }
}

export function VersionDiff({ packageName, versions }: VersionDiffProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [fromVersion, setFromVersion] = useState(versions[1] || versions[0]);
  const [toVersion, setToVersion] = useState(versions[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'dependencies' | 'code' | 'issues'>('overview');

  const { data: diff, isLoading, error } = useQuery({
    queryKey: ['version-diff', packageName, fromVersion, toVersion],
    queryFn: () => fetchVersionChanges(packageName, fromVersion, toVersion),
    enabled: isOpen && fromVersion !== toVersion,
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });

  // Debug logging
  useEffect(() => {
    if (isOpen && fromVersion !== toVersion) {
      console.log('VersionDiff Debug:', {
        packageName,
        fromVersion,
        toVersion,
        isLoading,
        hasData: !!diff,
        hasMigrationGuide: !!diff?.migrationGuide,
        error: error?.toString(),
      });
    }
  }, [isOpen, fromVersion, toVersion, isLoading, diff, error, packageName]);

  if (versions.length < 2) return null;

  const complexityConfig = {
    easy: { icon: CheckCircle, color: 'text-green-500', label: 'Easy Migration', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    moderate: { icon: Info, color: 'text-yellow-500', label: 'Moderate Effort', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    complex: { icon: AlertTriangle, color: 'text-red-500', label: 'Complex Migration', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const difficultyConfig = {
    easy: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    moderate: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    hard: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
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
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground">
              AI-Powered Migration Guide
            </h3>
            <p className="text-xs text-muted-foreground">
              Intelligent step-by-step upgrade assistant
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-foreground group-hover:text-foreground transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-6 animate-fade-in">
          {/* Version Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                From Version (Current)
              </label>
              <select
                value={fromVersion}
                onChange={(e) => {
                  setFromVersion(e.target.value);
                  setActiveTab('overview');
                }}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    v{v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                To Version (Target)
              </label>
              <select
                value={toVersion}
                onChange={(e) => {
                  setToVersion(e.target.value);
                  setActiveTab('overview');
                }}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    v{v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fromVersion === toVersion ? (
            <div className="p-6 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Please select different versions to generate a migration guide
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-6 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Analyzing version differences and generating migration guide...
                </p>
              </div>
            </div>
          ) : diff?.migrationGuide ? (
            <div className="space-y-6">
              {/* AI Badge */}
              {(() => {
                const fromMajor = parseInt(fromVersion.split('.')[0]);
                const toMajor = parseInt(toVersion.split('.')[0]);
                const hasKnowledge = hasPackageKnowledge(packageName, fromMajor, toMajor);
                
                return (
                  <div className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border",
                    hasKnowledge 
                      ? "bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/30"
                      : "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20"
                  )}>
                    {hasKnowledge ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            🎯 Package-Specific AI Guide
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tailored migration strategy for {packageName} {fromMajor}.x → {toMajor}.x
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">
                          🤖 AI-Generated Comprehensive Migration Guide
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Migration Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={cn(
                  'p-4 rounded-lg border',
                  difficultyConfig[diff.migrationGuide.difficulty].bg,
                  difficultyConfig[diff.migrationGuide.difficulty].border
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={cn('h-4 w-4', difficultyConfig[diff.migrationGuide.difficulty].color)} />
                    <span className="text-xs font-medium text-muted-foreground">Difficulty</span>
                  </div>
                  <p className={cn('text-lg font-bold capitalize', difficultyConfig[diff.migrationGuide.difficulty].color)}>
                    {diff.migrationGuide.difficulty}
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Estimated Time</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {diff.migrationGuide.estimatedTime}
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground">Breaking Changes</span>
                  </div>
                  <p className="text-lg font-bold text-orange-500">
                    {diff.migrationGuide.breakingChanges.length} found
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'steps', label: 'Migration Steps', icon: Terminal },
                  { id: 'dependencies', label: 'Dependencies', icon: Package },
                  { id: 'code', label: 'Code Changes', icon: Code },
                  { id: 'issues', label: 'Common Issues', icon: Wrench },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'overview' | 'steps' | 'dependencies' | 'code' | 'issues')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Breaking Changes */}
                    {diff.migrationGuide.breakingChanges.length > 0 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <h4 className="font-semibold text-red-500">Breaking Changes</h4>
                        </div>
                        <ul className="space-y-2">
                          {diff.migrationGuide.breakingChanges.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500 mt-1">•</span>
                              <span className="text-foreground">{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rollback Strategy */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-blue-500">Rollback Strategy</h4>
                      </div>
                      <code className="block p-3 bg-background rounded text-sm font-mono">
                        {diff.migrationGuide.rollbackStrategy}
                      </code>
                    </div>

                    {/* Changelog Link */}
                    {diff.changelog && (
                      <a
                        href={diff.changelog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary hover:bg-primary/20 transition-all"
                      >
                        View Full Changelog on GitHub
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div className="space-y-4">
                    {diff.migrationGuide.steps.map((step, idx) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        {step.code && (
                          <pre className="p-3 bg-background rounded-lg border border-border overflow-x-auto">
                            <code className="text-sm font-mono text-foreground">{step.code}</code>
                          </pre>
                        )}
                        {step.warning && (
                          <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">{step.warning}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Testing Recommendations */}
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-green-500">Testing Recommendations</h4>
                      </div>
                      <ul className="space-y-2">
                        {diff.migrationGuide.testingRecommendations.map((test, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-foreground">{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'dependencies' && (
                  <div className="space-y-4">
                    {diff.migrationGuide.dependencyUpdates.length === 0 ? (
                      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-green-600 dark:text-green-400">
                          No dependency updates required! 🎉
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground">
                            <strong>{diff.migrationGuide.dependencyUpdates.length}</strong> {diff.migrationGuide.dependencyUpdates.length === 1 ? 'dependency needs' : 'dependencies need'} to be updated for compatibility:
                          </p>
                        </div>

                        <div className="space-y-3">
                          {diff.migrationGuide.dependencyUpdates.map((dep, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'p-4 rounded-lg border',
                                dep.critical
                                  ? 'bg-red-500/10 border-red-500/20'
                                  : 'bg-muted/50 border-border'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                  <Package className={cn('h-4 w-4', dep.critical ? 'text-red-500' : 'text-primary')} />
                                  <span className="font-mono text-sm font-semibold">{dep.name}</span>
                                  {dep.critical && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded font-medium">
                                      Critical
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-2 text-xs font-mono">
                                <span className="text-muted-foreground">{dep.fromVersion}</span>
                                <ArrowRight className="h-3 w-3 text-primary" />
                                <span className="text-primary font-semibold">{dep.toVersion}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{dep.reason}</p>
                              {dep.toVersion !== 'Removed' && (
                                <code className="block mt-3 p-2 bg-background rounded text-xs font-mono">
                                  npm install {dep.name}@{dep.toVersion}
                                </code>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4">
                    {diff.migrationGuide.codeChanges.length === 0 ? (
                      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-green-600 dark:text-green-400">
                          No immediate code changes required. However, always review the official migration guide.
                        </p>
                      </div>
                    ) : (
                      diff.migrationGuide.codeChanges.map((change, idx) => (
                        <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <FileCode className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">{change.reason}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-red-500">Before</span>
                              </div>
                              <pre className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg overflow-x-auto">
                                <code className="text-xs font-mono">{change.before}</code>
                              </pre>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-green-500">After</span>
                              </div>
                              <pre className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg overflow-x-auto">
                                <code className="text-xs font-mono">{change.after}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {diff.migrationGuide.commonIssues.map((issue, idx) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-2">
                              Problem: {issue.issue}
                            </h4>
                            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <Lightbulb className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                  Solution:
                                </p>
                                <p className="text-sm text-foreground">{issue.solution}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-red-500">Unable to Generate Migration Guide</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {error 
                  ? `Error: ${error instanceof Error ? error.message : 'Failed to fetch version data'}`
                  : 'Could not retrieve version information from NPM registry. This might be due to:'
                }
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>One or both versions might not exist in the registry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Network connectivity issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>NPM registry rate limiting</span>
                </li>
              </ul>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
