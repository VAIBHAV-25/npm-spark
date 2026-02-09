import { useBundleSize } from '@/hooks/usePackages';
import { formatBytes } from '@/lib/npm-api';
import { Package2, FileArchive, Loader2, AlertCircle } from 'lucide-react';

interface BundleSizeCardProps {
  packageName: string;
  version?: string;
}

export function BundleSizeCard({ packageName, version }: BundleSizeCardProps) {
  const { data: bundleSize, isLoading, error } = useBundleSize(packageName, version);

  if (isLoading) {
    return (
      <div className="glass-card p-4 animate-fade-in-up">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !bundleSize) {
    return (
      <div className="glass-card p-4 animate-fade-in-up">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Bundle size data unavailable</span>
        </div>
      </div>
    );
  }

  const sizeStatus = bundleSize.gzip < 50 * 1024 ? 'success' : bundleSize.gzip < 200 * 1024 ? 'warning' : 'destructive';

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Package2 className="h-4 w-4" />
        Bundle Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <span className="stat-label">Minified</span>
          <span className="stat-value text-base">{formatBytes(bundleSize.size)}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Gzipped</span>
          <span className={`stat-value text-base ${
            sizeStatus === 'success' ? 'text-success' : 
            sizeStatus === 'warning' ? 'text-warning' : 
            'text-destructive'
          }`}>
            {formatBytes(bundleSize.gzip)}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label flex items-center gap-1">
            <FileArchive className="h-3 w-3" />
            Dependencies
          </span>
          <span className="stat-value text-base">{bundleSize.dependencyCount}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Side Effects</span>
          <span className="stat-value text-base">
            {bundleSize.hasSideEffects ? '⚠️ Yes' : '✅ No'}
          </span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground border-t border-border pt-2">
        {sizeStatus === 'success' && '✅ Excellent - Lightweight package'}
        {sizeStatus === 'warning' && '⚠️ Moderate - Consider tree-shaking'}
        {sizeStatus === 'destructive' && '🔴 Large - May impact performance'}
      </div>
    </div>
  );
}
