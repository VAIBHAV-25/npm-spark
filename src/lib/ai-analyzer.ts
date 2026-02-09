// AI-powered package analysis and recommendations

export interface AIRecommendation {
  type: 'upgrade' | 'alternative' | 'security' | 'performance' | 'maintenance';
  severity: 'high' | 'medium' | 'low';
  packageName: string;
  currentVersion?: string;
  suggestion: string;
  reason: string;
  alternatives?: Array<{
    name: string;
    reason: string;
    downloads: number;
  }>;
}

interface PackageData {
  name: string;
  currentVersion: string;
  latestVersion: string;
  weeklyDownloads: number;
  license: string;
  isOutdated: boolean;
  lastPublished?: string;
  dependencyCount?: number;
}

// Package alternatives database (commonly known better alternatives)
const PACKAGE_ALTERNATIVES: Record<string, Array<{ name: string; reason: string }>> = {
  'moment': [
    { name: 'date-fns', reason: 'Smaller bundle size (2KB vs 67KB), tree-shakeable, modern API' },
    { name: 'dayjs', reason: 'Moment.js compatible API but only 2KB, actively maintained' },
  ],
  'request': [
    { name: 'axios', reason: 'Modern, promise-based, better error handling, actively maintained' },
    { name: 'node-fetch', reason: 'Lightweight, follows Fetch API standard, better for Node.js' },
  ],
  'lodash': [
    { name: 'lodash-es', reason: 'ES modules version, better tree-shaking, smaller bundle size' },
    { name: 'ramda', reason: 'Functional programming focused, immutable, smaller footprint' },
  ],
  'node-sass': [
    { name: 'sass', reason: 'Pure JavaScript implementation, faster, no native dependencies' },
  ],
  'tslint': [
    { name: 'eslint', reason: 'TSLint is deprecated, ESLint with TypeScript plugin is the standard' },
  ],
  'uuid': [
    { name: 'nanoid', reason: '60% smaller, 60% faster, URL-friendly, more secure' },
  ],
  'mkdirp': [
    { name: 'fs.mkdir (native)', reason: 'Built into Node.js 10+, no dependency needed' },
  ],
  'rimraf': [
    { name: 'fs.rm (native)', reason: 'Built into Node.js 14.14+, no dependency needed' },
  ],
};

// Deprecated packages that should be replaced
const DEPRECATED_PACKAGES = [
  'request',
  'tslint',
  'node-sass',
  'babel-preset-es2015',
  'gulp-util',
  'mkdirp',
  'rimraf',
  'left-pad',
];

// Packages with known security issues (simplified - in production use npm audit API)
const SECURITY_CONCERNS = [
  'event-stream',
  'flatmap-stream',
  'eslint-scope',
];

export async function generateAIRecommendations(
  packages: PackageData[]
): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];

  for (const pkg of packages) {
    // 1. Check for deprecated packages
    if (DEPRECATED_PACKAGES.includes(pkg.name)) {
      const alternatives = PACKAGE_ALTERNATIVES[pkg.name] || [];
      recommendations.push({
        type: 'alternative',
        severity: 'high',
        packageName: pkg.name,
        currentVersion: pkg.currentVersion,
        suggestion: alternatives.length > 0
          ? `Replace ${pkg.name} with ${alternatives[0].name}`
          : `Consider replacing ${pkg.name} as it's deprecated`,
        reason: alternatives.length > 0
          ? alternatives[0].reason
          : 'This package is no longer maintained and may have security vulnerabilities',
        alternatives: alternatives.map(alt => ({
          name: alt.name,
          reason: alt.reason,
          downloads: 0, // Would fetch real data in production
        })),
      });
    }

    // 2. Check for better alternatives (even if not deprecated)
    if (PACKAGE_ALTERNATIVES[pkg.name] && !DEPRECATED_PACKAGES.includes(pkg.name)) {
      const alternatives = PACKAGE_ALTERNATIVES[pkg.name];
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        packageName: pkg.name,
        currentVersion: pkg.currentVersion,
        suggestion: `Consider ${alternatives[0].name} as an alternative`,
        reason: alternatives[0].reason,
        alternatives: alternatives.map(alt => ({
          name: alt.name,
          reason: alt.reason,
          downloads: 0,
        })),
      });
    }

    // 3. Check for outdated packages (major version behind)
    if (pkg.isOutdated) {
      const currentMajor = parseInt(pkg.currentVersion.split('.')[0]);
      const latestMajor = parseInt(pkg.latestVersion.split('.')[0]);
      
      if (latestMajor > currentMajor) {
        recommendations.push({
          type: 'upgrade',
          severity: latestMajor - currentMajor > 2 ? 'high' : 'medium',
          packageName: pkg.name,
          currentVersion: pkg.currentVersion,
          suggestion: `Upgrade to v${pkg.latestVersion}`,
          reason: `You're ${latestMajor - currentMajor} major version${latestMajor - currentMajor > 1 ? 's' : ''} behind. May include important features and security fixes.`,
        });
      } else {
        recommendations.push({
          type: 'upgrade',
          severity: 'low',
          packageName: pkg.name,
          currentVersion: pkg.currentVersion,
          suggestion: `Update to v${pkg.latestVersion}`,
          reason: 'Minor/patch updates available with bug fixes and improvements',
        });
      }
    }

    // 4. Check for security concerns
    if (SECURITY_CONCERNS.includes(pkg.name)) {
      recommendations.push({
        type: 'security',
        severity: 'high',
        packageName: pkg.name,
        currentVersion: pkg.currentVersion,
        suggestion: `Remove or replace ${pkg.name} immediately`,
        reason: 'This package has known security vulnerabilities',
      });
    }

    // 5. Check for unmaintained packages (last published > 2 years ago)
    if (pkg.lastPublished) {
      const lastPublishedDate = new Date(pkg.lastPublished);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      if (lastPublishedDate < twoYearsAgo) {
        recommendations.push({
          type: 'maintenance',
          severity: 'medium',
          packageName: pkg.name,
          currentVersion: pkg.currentVersion,
          suggestion: 'Consider finding an actively maintained alternative',
          reason: `Last published ${Math.floor((Date.now() - lastPublishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365))} years ago. May lack modern features and security updates.`,
        });
      }
    }

    // 6. Check for low popularity (potential abandonment)
    if (pkg.weeklyDownloads < 100 && pkg.weeklyDownloads > 0) {
      recommendations.push({
        type: 'maintenance',
        severity: 'low',
        packageName: pkg.name,
        currentVersion: pkg.currentVersion,
        suggestion: 'Verify this package is still maintained',
        reason: `Very low download count (${pkg.weeklyDownloads}/week). Consider more popular alternatives.`,
      });
    }

    // 7. Check for packages with many dependencies (bloat)
    if ((pkg.dependencyCount ?? 0) > 50) {
      recommendations.push({
        type: 'performance',
        severity: 'low',
        packageName: pkg.name,
        currentVersion: pkg.currentVersion,
        suggestion: 'Consider lighter alternatives',
        reason: `This package has ${pkg.dependencyCount} dependencies, which may increase bundle size and security surface.`,
      });
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function generateProjectHealthScore(packages: PackageData[]): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Array<{ name: string; impact: number; description: string }>;
} {
  let score = 100;
  const factors: Array<{ name: string; impact: number; description: string }> = [];

  const outdatedCount = packages.filter(p => p.isOutdated).length;
  const deprecatedCount = packages.filter(p => DEPRECATED_PACKAGES.includes(p.name)).length;
  const securityCount = packages.filter(p => SECURITY_CONCERNS.includes(p.name)).length;
  
  // Calculate deductions
  if (outdatedCount > 0) {
    const impact = Math.min(outdatedCount * 2, 30);
    score -= impact;
    factors.push({
      name: 'Outdated Packages',
      impact: -impact,
      description: `${outdatedCount} package${outdatedCount > 1 ? 's are' : ' is'} outdated`,
    });
  }

  if (deprecatedCount > 0) {
    const impact = deprecatedCount * 15;
    score -= impact;
    factors.push({
      name: 'Deprecated Packages',
      impact: -impact,
      description: `${deprecatedCount} deprecated package${deprecatedCount > 1 ? 's' : ''} found`,
    });
  }

  if (securityCount > 0) {
    const impact = securityCount * 25;
    score -= impact;
    factors.push({
      name: 'Security Issues',
      impact: -impact,
      description: `${securityCount} package${securityCount > 1 ? 's have' : ' has'} security concerns`,
    });
  }

  // Bonus points for good practices
  const avgDownloads = packages.reduce((sum, p) => sum + p.weeklyDownloads, 0) / packages.length;
  if (avgDownloads > 100000) {
    factors.push({
      name: 'Popular Packages',
      impact: 5,
      description: 'Using well-established, popular packages',
    });
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade, factors };
}

export function generateOptimizationSuggestions(packages: PackageData[]): string[] {
  const suggestions: string[] = [];

  // Check for duplicate functionality
  const hasLodash = packages.some(p => p.name === 'lodash');
  const hasUnderscore = packages.some(p => p.name === 'underscore');
  if (hasLodash && hasUnderscore) {
    suggestions.push('You have both lodash and underscore. Consider using only one utility library.');
  }

  // Check for moment.js
  if (packages.some(p => p.name === 'moment')) {
    suggestions.push('Consider replacing moment.js with date-fns or dayjs for a smaller bundle size (67KB → 2KB).');
  }

  // Check for native alternatives
  const hasRimraf = packages.some(p => p.name === 'rimraf');
  const hasMkdirp = packages.some(p => p.name === 'mkdirp');
  if (hasRimraf || hasMkdirp) {
    suggestions.push('Node.js 14+ has native fs.rm and fs.mkdir with recursive option. Consider removing rimraf/mkdirp.');
  }

  // Check for large dependency trees
  const heavyPackages = packages.filter(p => (p.dependencyCount ?? 0) > 30);
  if (heavyPackages.length > 0) {
    suggestions.push(`${heavyPackages.length} package${heavyPackages.length > 1 ? 's have' : ' has'} large dependency trees. Review for potential bundle size optimization.`);
  }

  // Check for outdated major versions
  const majorOutdated = packages.filter(p => {
    if (!p.isOutdated) return false;
    const currentMajor = parseInt(p.currentVersion.split('.')[0]);
    const latestMajor = parseInt(p.latestVersion.split('.')[0]);
    return latestMajor > currentMajor + 1;
  });
  if (majorOutdated.length > 0) {
    suggestions.push(`${majorOutdated.length} package${majorOutdated.length > 1 ? 's are' : ' is'} 2+ major versions behind. Plan an upgrade strategy.`);
  }

  return suggestions;
}
