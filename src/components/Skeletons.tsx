import { Skeleton } from '@/components/ui/skeleton';

export function PackageCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PackageDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function DownloadsChartSkeleton() {
  return (
    <div className="glass-card p-4">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 80 + 20}%` }} 
          />
        ))}
      </div>
    </div>
  );
}
