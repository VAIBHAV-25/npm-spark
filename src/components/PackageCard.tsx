import { Link } from 'react-router-dom';
import { formatDownloads, formatRelativeDate } from '@/lib/npm-api';
import { NpmSearchResult } from '@/types/npm';
import { Package, Calendar, User, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaved } from '@/hooks/useSaved';

interface PackageCardProps {
  result: NpmSearchResult;
  downloads?: number;
}

export function PackageCard({ result, downloads }: PackageCardProps) {
  const { package: pkg } = result;
  const saved = useSaved();
  const fav = saved.isSaved('favorites', pkg.name);
  const watch = saved.isSaved('watchlist', pkg.name);

  return (
    <Link
      to={`/package/${encodeURIComponent(pkg.name)}`}
      className="glass-card-hover block p-5 animate-fade-in relative"
    >
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={fav ? "h-8 w-8 text-primary" : "h-8 w-8 text-muted-foreground"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            saved.toggleSaved('favorites', pkg.name);
          }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={watch ? "h-8 w-8 text-primary" : "h-8 w-8 text-muted-foreground"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            saved.toggleSaved('watchlist', pkg.name);
          }}
          aria-label={watch ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
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
