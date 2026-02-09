export type FetchJsonOptions = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retries?: number;
  retryDelayMs?: number;
  cacheKey?: string;
  cacheTtlMs?: number;
};

type CacheEntry<T> = {
  t: number;
  v: T;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function now() {
  return Date.now();
}

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCache<T>(key: string): CacheEntry<T> | null {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, entry: CacheEntry<T>) {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    return;
  }
}

function isRetryableStatus(status: number) {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function fetchJson<T>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
  const retries = opts.retries ?? 2;
  const baseDelay = opts.retryDelayMs ?? 300;

  const cacheKey = opts.cacheKey ? `cache:${opts.cacheKey}` : undefined;
  const ttl = opts.cacheTtlMs ?? 0;

  if (cacheKey && ttl > 0) {
    const cached = readCache<T>(cacheKey);
    if (cached && now() - cached.t < ttl) {
      return cached.v;
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: opts.signal,
        headers: {
          Accept: "application/json",
          ...opts.headers,
        },
      });

      if (!res.ok) {
        if (attempt < retries && isRetryableStatus(res.status)) {
          const delay = Math.round(baseDelay * Math.pow(2, attempt) + Math.random() * 150);
          await sleep(delay);
          continue;
        }
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as T;
      if (cacheKey && ttl > 0) {
        writeCache(cacheKey, { t: now(), v: data });
      }
      return data;
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        const delay = Math.round(baseDelay * Math.pow(2, attempt) + Math.random() * 150);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

