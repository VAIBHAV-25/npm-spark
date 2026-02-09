import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { popularPackages, searchPackages } from "@/lib/npm-api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getRecentSearches } from "@/lib/recent-searches";

export type SuggestionItem =
  | { type: "package"; value: string; description?: string }
  | { type: "recent"; value: string }
  | { type: "popular"; value: string };

function uniq(items: SuggestionItem[]) {
  const seen = new Set<string>();
  const out: SuggestionItem[] = [];
  for (const it of items) {
    const k = it.value;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export function useSearchSuggestions(rawQuery: string) {
  const query = rawQuery.trim();
  const debounced = useDebouncedValue(query, 150);

  const api = useQuery({
    queryKey: ["suggestions", debounced],
    queryFn: async () => {
      const res = await searchPackages(debounced, 8, 0);
      return res.objects.map((o) => ({
        type: "package" as const,
        value: o.package.name,
        description: o.package.description,
      }));
    },
    enabled: debounced.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  return useMemo(() => {
    const recent = getRecentSearches();
    const recentItems: SuggestionItem[] =
      query.length === 0
        ? recent.slice(0, 6).map((v) => ({ type: "recent", value: v }))
        : recent
            .filter((v) => v.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 4)
            .map((v) => ({ type: "recent", value: v }));

    const popularItems: SuggestionItem[] =
      query.length === 0
        ? popularPackages.slice(0, 8).map((v) => ({ type: "popular", value: v }))
        : popularPackages
            .filter((v) => v.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 6)
            .map((v) => ({ type: "popular", value: v }));

    const apiItems = (api.data || []) as SuggestionItem[];

    const merged = uniq([...apiItems, ...recentItems, ...popularItems]);

    return {
      query,
      debounced,
      items: merged.slice(0, 12),
      apiLoading: api.isLoading,
    };
  }, [api.data, api.isLoading, debounced, query]);
}

