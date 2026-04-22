interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private hits = 0;
  private misses = 0;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    try {
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
        lastAccessed: Date.now(),
      });
    } catch (error) {
      console.warn("Cache set error:", error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        this.misses++;
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        this.misses++;
        return null;
      }

      entry.lastAccessed = Date.now();
      this.hits++;
      return entry.value as T;
    } catch (error) {
      console.warn("Cache get error:", error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    try {
      this.cache.delete(key);
    } catch (error) {
      console.warn("Cache delete error:", error);
    }
  }

  clear(): void {
    try {
      this.cache.clear();
    } catch (error) {
      console.warn("Cache clear error:", error);
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  startCleanup(intervalMs = 60000): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => {
      try {
        const now = Date.now();
        let deleted = 0;
        for (const [key, entry] of this.cache.entries()) {
          if (now > entry.expiresAt) {
            this.cache.delete(key);
            deleted++;
          }
        }
        if (deleted > 0) {
          console.log(`Cache cleanup: Removed ${deleted} expired entries`);
        }
      } catch (error) {
        console.warn("Cache cleanup error:", error);
      }
    }, intervalMs);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getMetrics(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.cache.size,
    };
  }
}

export function createCache(maxSize = 1000): InMemoryCache {
  return new InMemoryCache(maxSize);
}

export const githubCache = new InMemoryCache(5000);
githubCache.startCleanup();

export function createCacheKey(
  owner: string,
  repo: string,
  suffix: string,
): string {
  return `github:${owner}/${repo}:${suffix}`;
}
