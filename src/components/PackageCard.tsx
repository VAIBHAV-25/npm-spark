import { Link } from 'react-router-dom';
import { formatDownloads, formatRelativeDate } from '@/lib/npm-api';
import { NpmSearchResult } from '@/types/npm';
import { Package, Calendar, User } from 'lucide-react';

interface PackageCardProps {
  result: NpmSearchResult;
  downloads?: number;
}

export function PackageCard({ result, downloads }: PackageCardProps) {
  const { package: pkg } = result;

  return (
    <Link
      to={`/package/${encodeURIComponent(pkg.name)}`}
      className="glass-card-hover block p-5 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-mono text-lg font-semibold text-foreground truncate">
              {pkg.name}
            </h3>
            <span className="badge-primary shrink-0">v{pkg.version}</span>
          </div>
          
          {pkg.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {pkg.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {pkg.publisher && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {pkg.publisher.username}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeDate(pkg.date)}
            </span>
            {downloads !== undefined && (
              <span className="text-primary font-medium">
                {formatDownloads(downloads)} downloads/week
              </span>
            )}
          </div>

          {pkg.keywords && pkg.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pkg.keywords.slice(0, 5).map((keyword) => (
                <span key={keyword} className="chip">
                  {keyword}
                </span>
              ))}
              {pkg.keywords.length > 5 && (
                <span className="chip">+{pkg.keywords.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
