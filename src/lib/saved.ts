import { readJson, writeJson } from "@/lib/storage";

export type SavedListKey = "favorites" | "watchlist";

const STORAGE_KEY = "npmx:saved:v1";

type SavedState = {
  favorites: string[];
  watchlist: string[];
};

const emptyState: SavedState = { favorites: [], watchlist: [] };

function normalize(name: string) {
  return name.trim();
}

function uniq(items: string[]) {
  return Array.from(new Set(items));
}

export function getSavedState(): SavedState {
  return readJson<SavedState>(STORAGE_KEY, emptyState);
}

export function isSaved(list: SavedListKey, name: string) {
  const s = getSavedState();
  return s[list].includes(normalize(name));
}

export function toggleSaved(list: SavedListKey, name: string) {
  const n = normalize(name);
  const s = getSavedState();
  const has = s[list].includes(n);
  const next = has ? s[list].filter((x) => x !== n) : uniq([n, ...s[list]]);
  const updated: SavedState = { ...s, [list]: next };
  writeJson(STORAGE_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("npmx:saved"));
  }
  return updated;
}

export function removeSaved(list: SavedListKey, name: string) {
  const n = normalize(name);
  const s = getSavedState();
  const updated: SavedState = { ...s, [list]: s[list].filter((x) => x !== n) };
  writeJson(STORAGE_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("npmx:saved"));
  }
  return updated;
}

export function clearSaved(list: SavedListKey) {
  const s = getSavedState();
  const updated: SavedState = { ...s, [list]: [] };
  writeJson(STORAGE_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("npmx:saved"));
  }
  return updated;
}

