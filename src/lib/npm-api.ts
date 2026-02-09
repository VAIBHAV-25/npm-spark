import { NpmSearchResponse, NpmPackageDetails, NpmDownloads, NpmDownloadsRange } from '@/types/npm';
import { fetchJson } from '@/lib/http';

const REGISTRY_URL = 'https://registry.npmjs.org';
const DOWNLOADS_API = 'https://api.npmjs.org/downloads';
const BUNDLEPHOBIA_API = 'https://bundlephobia.com/api';
const GITHUB_API = 'https://api.github.com';

export async function searchPackages(
  query: string,
  size: number = 20,
  from: number = 0
): Promise<NpmSearchResponse> {
  const url = `${REGISTRY_URL}/-/v1/search?text=${encodeURIComponent(query)}&size=${size}&from=${from}`;
  return fetchJson<NpmSearchResponse>(url, {
    cacheKey: `npm:search:${query}:${size}:${from}`,
    cacheTtlMs: 1000 * 60 * 2,
    retries: 2,
    retryDelayMs: 250,
  });
}

export async function getPackageDetails(name: string): Promise<NpmPackageDetails> {
  const encodedName = encodeURIComponent(name).replace('%40', '@');
  const url = `${REGISTRY_URL}/${encodedName}`;
  try {
    return await fetchJson<NpmPackageDetails>(url, {
      cacheKey: `npm:pkg:${encodedName}`,
      cacheTtlMs: 1000 * 60 * 10,
      retries: 2,
      retryDelayMs: 300,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('404')) {
      throw new Error(`Package "${name}" not found`);
    }
    throw e instanceof Error ? e : new Error('Failed to fetch package');
  }
}

export async function getWeeklyDownloads(name: string): Promise<NpmDownloads> {
  const encodedName = encodeURIComponent(name).replace('%40', '@');
  const url = `${DOWNLOADS_API}/point/last-week/${encodedName}`;
  try {
    return await fetchJson<NpmDownloads>(url, {
      cacheKey: `npm:dl-week:${encodedName}`,
      cacheTtlMs: 1000 * 60 * 10,
      retries: 1,
      retryDelayMs: 250,
    });
  } catch {
    return { downloads: 0, start: '', end: '', package: name };
  }
}

export async function getDownloadsRange(
  name: string,
  period: 'last-month' | 'last-week' | 'last-year' = 'last-month'
): Promise<NpmDownloadsRange> {
  const encodedName = encodeURIComponent(name).replace('%40', '@');
  const url = `${DOWNLOADS_API}/range/${period}/${encodedName}`;
  try {
    return await fetchJson<NpmDownloadsRange>(url, {
      cacheKey: `npm:dl-range:${period}:${encodedName}`,
      cacheTtlMs: 1000 * 60 * 10,
      retries: 1,
      retryDelayMs: 250,
    });
  } catch {
    return { downloads: [], start: '', end: '', package: name };
  }
}

export function formatDownloads(downloads: number): string {
  if (downloads >= 1_000_000_000) {
    return `${(downloads / 1_000_000_000).toFixed(1)}B`;
  }
  if (downloads >= 1_000_000) {
    return `${(downloads / 1_000_000).toFixed(1)}M`;
  }
  if (downloads >= 1_000) {
    return `${(downloads / 1_000).toFixed(1)}K`;
  }
  return downloads.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function extractGitHubInfo(repoUrl?: string): { owner: string; repo: string } | null {
  if (!repoUrl) return null;
  
  const patterns = [
    /github\.com[/:]([\w-]+)\/([\w-]+)/,
    /git\+https:\/\/github\.com\/([\w-]+)\/([\w-]+)/,
    /git:\/\/github\.com\/([\w-]+)\/([\w-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = repoUrl.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  
  return null;
}

export function getGitHubUrl(repoInfo: { owner: string; repo: string }): string {
  return `https://github.com/${repoInfo.owner}/${repoInfo.repo}`;
}

export interface BundleSizeInfo {
  name: string;
  version: string;
  size: number;
  gzip: number;
  dependencyCount: number;
  hasSideEffects: boolean;
}

export interface GitHubRepoInfo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  description: string;
  language: string;
  topics: string[];
  default_branch: string;
}

export async function getBundleSize(name: string, version?: string): Promise<BundleSizeInfo | null> {
  const packageSpec = version ? `${name}@${version}` : name;
  const url = `${BUNDLEPHOBIA_API}/size?package=${encodeURIComponent(packageSpec)}`;
  
  try {
    return await fetchJson<BundleSizeInfo>(url, {
      cacheKey: `bundle:${packageSpec}`,
      cacheTtlMs: 1000 * 60 * 60,
      retries: 1,
      retryDelayMs: 500,
    });
  } catch {
    return null;
  }
}

export async function getGitHubRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}`;
  
  try {
    return await fetchJson<GitHubRepoInfo>(url, {
      cacheKey: `github:${owner}:${repo}`,
      cacheTtlMs: 1000 * 60 * 30,
      retries: 1,
      retryDelayMs: 500,
    });
  } catch {
    return null;
  }
}

export async function getSimilarPackages(packageName: string): Promise<string[]> {
  try {
    const searchTerms = packageName.split('-').join(' ');
    const results = await searchPackages(searchTerms, 10, 0);
    return results.objects
      .map(obj => obj.package.name)
      .filter(name => name !== packageName)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export const popularPackages = [
  'react',
  'vue',
  'angular',
  'next',
  'express',
  'typescript',
  'lodash',
  'axios',
  'tailwindcss',
  'vite',
  'webpack',
  'eslint',
  'jest',
  'moment',
  'date-fns',
];
