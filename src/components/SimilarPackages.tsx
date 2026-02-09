import { useSimilarPackages } from '@/hooks/usePackages';
import { Link } from 'react-router-dom';
import { Package, Loader2, Lightbulb } from 'lucide-react';

interface SimilarPackagesProps {
  packageName: string;
}

export function SimilarPackages({ packageName }: SimilarPackagesProps) {
  const { data: similarPackages, isLoading } = useSimilarPackages(packageName);

  if (isLoading) {
    return (
      <div className="glass-card p-4 animate-fade-in-up">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!similarPackages || similarPackages.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 hover:scale-105 transition-transform animate-fade-in-up">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        Similar Packages
      </h4>
      <div className="space-y-2">
        {similarPackages.map((pkgName) => (
          <Link
            key={pkgName}
            to={`/package/${encodeURIComponent(pkgName)}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <Package className="h-3 w-3 group-hover:scale-110 transition-transform" />
            <span className="font-mono truncate">{pkgName}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
