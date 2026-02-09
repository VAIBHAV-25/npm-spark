import { Scale, CheckCircle, AlertTriangle, XCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './ui/button';

interface LicenseCheckerProps {
  license: string | { type: string; url?: string } | undefined;
  packageName: string;
}

type LicenseType = 'permissive' | 'copyleft' | 'weak-copyleft' | 'proprietary' | 'unknown';

interface LicenseInfo {
  type: LicenseType;
  name: string;
  description: string;
  canUseCommercially: boolean;
  canModify: boolean;
  canDistribute: boolean;
  mustIncludeLicense: boolean;
  mustDiscloseSource: boolean;
  color: string;
  icon: typeof CheckCircle;
  url?: string;
}

const licenseDatabase: Record<string, LicenseInfo> = {
  'MIT': {
    type: 'permissive',
    name: 'MIT License',
    description: 'Very permissive. Can be used in commercial projects with minimal restrictions.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://opensource.org/licenses/MIT',
  },
  'Apache-2.0': {
    type: 'permissive',
    name: 'Apache License 2.0',
    description: 'Permissive license with patent grant. Safe for commercial use.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://opensource.org/licenses/Apache-2.0',
  },
  'BSD-3-Clause': {
    type: 'permissive',
    name: 'BSD 3-Clause License',
    description: 'Permissive license similar to MIT. Safe for commercial use.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://opensource.org/licenses/BSD-3-Clause',
  },
  'BSD-2-Clause': {
    type: 'permissive',
    name: 'BSD 2-Clause License',
    description: 'Very permissive. Safe for commercial use.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://opensource.org/licenses/BSD-2-Clause',
  },
  'ISC': {
    type: 'permissive',
    name: 'ISC License',
    description: 'Functionally equivalent to MIT. Safe for commercial use.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://opensource.org/licenses/ISC',
  },
  'GPL-3.0': {
    type: 'copyleft',
    name: 'GNU General Public License v3.0',
    description: 'Strong copyleft. Requires derivative works to be open source under GPL.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: true,
    color: 'text-red-500',
    icon: XCircle,
    url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
  },
  'GPL-2.0': {
    type: 'copyleft',
    name: 'GNU General Public License v2.0',
    description: 'Strong copyleft. Requires derivative works to be open source under GPL.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: true,
    color: 'text-red-500',
    icon: XCircle,
    url: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html',
  },
  'AGPL-3.0': {
    type: 'copyleft',
    name: 'GNU Affero General Public License v3.0',
    description: 'Strongest copyleft. Requires source disclosure even for network use.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: true,
    color: 'text-red-500',
    icon: XCircle,
    url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
  },
  'LGPL-3.0': {
    type: 'weak-copyleft',
    name: 'GNU Lesser General Public License v3.0',
    description: 'Weak copyleft. Can be used in proprietary software if dynamically linked.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-yellow-500',
    icon: AlertTriangle,
    url: 'https://www.gnu.org/licenses/lgpl-3.0.en.html',
  },
  'MPL-2.0': {
    type: 'weak-copyleft',
    name: 'Mozilla Public License 2.0',
    description: 'Weak copyleft. Modified files must be open source, but can be combined with proprietary code.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-yellow-500',
    icon: AlertTriangle,
    url: 'https://www.mozilla.org/en-US/MPL/2.0/',
  },
  'EPL-2.0': {
    type: 'weak-copyleft',
    name: 'Eclipse Public License 2.0',
    description: 'Weak copyleft. Similar to MPL.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-yellow-500',
    icon: AlertTriangle,
    url: 'https://www.eclipse.org/legal/epl-2.0/',
  },
  'Unlicense': {
    type: 'permissive',
    name: 'The Unlicense',
    description: 'Public domain equivalent. No restrictions whatsoever.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: false,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://unlicense.org/',
  },
  'CC0-1.0': {
    type: 'permissive',
    name: 'Creative Commons Zero v1.0',
    description: 'Public domain dedication. No restrictions.',
    canUseCommercially: true,
    canModify: true,
    canDistribute: true,
    mustIncludeLicense: false,
    mustDiscloseSource: false,
    color: 'text-green-500',
    icon: CheckCircle,
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
};

function parseLicense(license: string | { type: string; url?: string } | undefined): string {
  if (!license) return 'Unknown';
  if (typeof license === 'string') return license;
  return license.type || 'Unknown';
}

export function LicenseChecker({ license, packageName }: LicenseCheckerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const licenseString = parseLicense(license);
  
  // Handle SPDX expressions (e.g., "MIT OR Apache-2.0")
  const licenses = licenseString.split(/\s+(?:OR|AND)\s+/i);
  const primaryLicense = licenses[0].trim();
  
  const licenseInfo = licenseDatabase[primaryLicense] || {
    type: 'unknown',
    name: licenseString,
    description: 'License information not available. Please review manually.',
    canUseCommercially: false,
    canModify: false,
    canDistribute: false,
    mustIncludeLicense: true,
    mustDiscloseSource: false,
    color: 'text-gray-500',
    icon: Info,
  };

  const Icon = licenseInfo.icon;

  const getCompatibilityText = () => {
    switch (licenseInfo.type) {
      case 'permissive':
        return 'Compatible with most projects, including commercial use';
      case 'weak-copyleft':
        return 'Use with caution in proprietary software. Review requirements carefully';
      case 'copyleft':
        return 'Warning: Requires derivative works to be open source';
      case 'proprietary':
        return 'Proprietary license. Review terms carefully';
      default:
        return 'Unknown license. Manual review required';
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">License Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* License Header */}
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', licenseInfo.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{licenseInfo.name}</span>
              {licenses.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  (+{licenses.length - 1} more)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{licenseInfo.description}</p>
          </div>
        </div>

        {/* Compatibility Status */}
        <div className={cn(
          'p-3 rounded-lg border',
          licenseInfo.type === 'permissive' && 'bg-green-500/10 border-green-500/20',
          licenseInfo.type === 'weak-copyleft' && 'bg-yellow-500/10 border-yellow-500/20',
          licenseInfo.type === 'copyleft' && 'bg-red-500/10 border-red-500/20',
          licenseInfo.type === 'unknown' && 'bg-gray-500/10 border-gray-500/20'
        )}>
          <p className="text-sm font-medium">{getCompatibilityText()}</p>
        </div>

        {/* License Details */}
        {licenseInfo.type !== 'unknown' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? 'Hide' : 'Show'} License Details
            </Button>

            {showDetails && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    {licenseInfo.canUseCommercially ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Commercial Use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {licenseInfo.canModify ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Modification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {licenseInfo.canDistribute ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!licenseInfo.mustDiscloseSource ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Private Use</span>
                  </div>
                </div>

                {(licenseInfo.mustIncludeLicense || licenseInfo.mustDiscloseSource) && (
                  <div className="p-3 bg-background/50 rounded border border-border">
                    <p className="text-xs font-medium mb-2">Requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {licenseInfo.mustIncludeLicense && (
                        <li>• Must include license and copyright notice</li>
                      )}
                      {licenseInfo.mustDiscloseSource && (
                        <li>• Must disclose source code of derivative works</li>
                      )}
                    </ul>
                  </div>
                )}

                {licenseInfo.url && (
                  <a
                    href={licenseInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Read Full License Text
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {/* Unknown License Warning */}
        {licenseInfo.type === 'unknown' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Unknown License</p>
                <p>
                  This package uses a license that's not in our database. Please review the license
                  manually on{' '}
                  <a
                    href={`https://www.npmjs.com/package/${packageName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    npm
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
