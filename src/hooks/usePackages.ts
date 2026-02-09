import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  searchPackages,
  getPackageDetails,
  getWeeklyDownloads,
  getDownloadsRange,
} from '@/lib/npm-api';
import { NpmSearchResult } from '@/types/npm';

export function usePackageSearch(query: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['packageSearch', query],
    queryFn: ({ pageParam = 0 }) => searchPackages(query, 20, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.objects.length, 0);
      if (loadedCount >= lastPage.total) return undefined;
      return loadedCount;
    },
    initialPageParam: 0,
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePackageDetails(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['packageDetails', name],
    queryFn: () => getPackageDetails(name),
    enabled: enabled && name.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useWeeklyDownloads(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['weeklyDownloads', name],
    queryFn: () => getWeeklyDownloads(name),
    enabled: enabled && name.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDownloadsRange(
  name: string,
  period: 'last-month' | 'last-week' | 'last-year' = 'last-month',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['downloadsRange', name, period],
    queryFn: () => getDownloadsRange(name, period),
    enabled: enabled && name.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMultiplePackageDetails(names: string[]) {
  return useQuery({
    queryKey: ['multiplePackages', names],
    queryFn: async () => {
      const results = await Promise.all(names.map((name) => getPackageDetails(name)));
      return results;
    },
    enabled: names.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMultipleDownloads(names: string[]) {
  return useQuery({
    queryKey: ['multipleDownloads', names],
    queryFn: async () => {
      const results = await Promise.all(names.map((name) => getWeeklyDownloads(name)));
      return results;
    },
    enabled: names.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePackageSearchScore(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['packageSearchScore', name],
    queryFn: async () => {
      const res = await searchPackages(name, 20, 0);
      const exact = res.objects.find((o) => o.package.name === name);
      return (exact || null) as NpmSearchResult | null;
    },
    enabled: enabled && name.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}
