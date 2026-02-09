import { readJson, writeJson } from "@/lib/storage";

const KEY = "npmx:recentSearches:v1";
const MAX = 10;

export function getRecentSearches() {
  return readJson<string[]>(KEY, []);
}

export function addRecentSearch(term: string) {
  const t = term.trim();
  if (!t) return getRecentSearches();
  const existing = getRecentSearches().filter((x) => x !== t);
  const next = [t, ...existing].slice(0, MAX);
  writeJson(KEY, next);
  return next;
}

export function clearRecentSearches() {
  writeJson(KEY, []);
}

