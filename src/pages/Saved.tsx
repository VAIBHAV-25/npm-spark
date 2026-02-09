import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/hooks/useSaved";
import { useMultiplePackageDetails, useMultipleDownloads } from "@/hooks/usePackages";
import { formatDownloads, formatRelativeDate } from "@/lib/npm-api";
import { Link } from "react-router-dom";
import { Bookmark, Star, Eye, Trash2, Package, Calendar, Download } from "lucide-react";

function SavedRow({
  name,
  description,
  version,
  updatedAt,
  downloads,
  onRemove,
}: {
  name: string;
  description?: string;
  version?: string;
  updatedAt?: string;
  downloads?: number;
  onRemove: () => void;
}) {
  return (
    <div className="glass-card-hover p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <Link
              to={`/package/${encodeURIComponent(name)}`}
              className="font-mono text-lg font-semibold text-foreground truncate hover:underline"
            >
              {name}
            </Link>
            {version && <span className="badge-primary shrink-0">v{version}</span>}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {updatedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatRelativeDate(updatedAt)}
              </span>
            )}
            {downloads !== undefined && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Download className="h-3 w-3" />
                {formatDownloads(downloads)} downloads/week
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-2" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Saved() {
  const saved = useSaved();

  const favorites = saved.favorites;
  const watchlist = saved.watchlist;

  const { data: favoriteDetails } = useMultiplePackageDetails(favorites);
  const { data: watchDetails } = useMultiplePackageDetails(watchlist);

  const { data: favoriteDownloads } = useMultipleDownloads(favorites);
  const { data: watchDownloads } = useMultipleDownloads(watchlist);

  const favDlMap = new Map(favoriteDownloads?.map((d) => [d.package, d.downloads]) || []);
  const watchDlMap = new Map(watchDownloads?.map((d) => [d.package, d.downloads]) || []);

  const renderList = (names: string[], details: typeof favoriteDetails | undefined, dlMap: Map<string, number>, listKey: "favorites" | "watchlist") => {
    if (names.length === 0) {
      return (
        <div className="glass-card p-10 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nothing saved yet.</p>
        </div>
      );
    }

    const detailMap = new Map((details || []).map((d) => [d.name, d]));

    return (
      <div className="space-y-4">
        {names.map((name) => {
          const d = detailMap.get(name);
          const latest = d?.["dist-tags"]?.latest;
          const latestInfo = latest ? d?.versions?.[latest] : undefined;
          return (
            <SavedRow
              key={name}
              name={name}
              description={d?.description}
              version={latest}
              updatedAt={latest ? d?.time?.[latest] : undefined}
              downloads={dlMap.get(name)}
              onRemove={() => saved.removeSaved(listKey, name)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8" id="main-content" tabIndex={-1}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bookmark className="h-7 w-7 text-primary" />
              Saved
            </h1>
            <p className="text-muted-foreground mt-1">
              Keep track of packages you care about.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => saved.clearSaved("favorites")}
              disabled={favorites.length === 0}
            >
              <Star className="h-4 w-4" />
              Clear favorites
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => saved.clearSaved("watchlist")}
              disabled={watchlist.length === 0}
            >
              <Eye className="h-4 w-4" />
              Clear watchlist
            </Button>
          </div>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="favorites"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              <Eye className="h-4 w-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-6">
            {renderList(favorites, favoriteDetails, favDlMap, "favorites")}
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            {renderList(watchlist, watchDetails, watchDlMap, "watchlist")}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

