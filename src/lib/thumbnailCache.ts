// Thumbnail cache system for storing generated intelligent thumbnails
export interface CachedThumbnail {
  url: string;
  thumbnail: string;
  domain: string;
  category?: string;
  timestamp: number;
  type: 'intelligent' | 'favicon' | 'placeholder';
}

export class ThumbnailCache {
  private static readonly STORAGE_KEY = 'thumbnailCache';
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static get(): CachedThumbnail[] {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  static set(thumbnails: CachedThumbnail[]): void {
    try {
      // Remove expired entries
      const now = Date.now();
      const filtered = thumbnails.filter(
        item => now - item.timestamp < this.CACHE_DURATION
      );

      // Keep only the most recent entries if cache is too large
      const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);
      const limited = sorted.slice(0, this.MAX_CACHE_SIZE);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save thumbnail cache:', error);
    }
  }

  static getCachedThumbnail(url: string): CachedThumbnail | null {
    const cache = this.get();
    const cached = cache.find(item => item.url === url);
    
    if (!cached) return null;

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.removeCachedThumbnail(url);
      return null;
    }

    return cached;
  }

  static addCachedThumbnail(
    url: string,
    thumbnail: string,
    domain: string,
    type: 'intelligent' | 'favicon' | 'placeholder',
    category?: string
  ): void {
    const cache = this.get();
    const existingIndex = cache.findIndex(item => item.url === url);

    const newEntry: CachedThumbnail = {
      url,
      thumbnail,
      domain,
      category,
      timestamp: Date.now(),
      type
    };

    if (existingIndex >= 0) {
      cache[existingIndex] = newEntry;
    } else {
      cache.push(newEntry);
    }

    this.set(cache);
  }

  static removeCachedThumbnail(url: string): void {
    const cache = this.get();
    const filtered = cache.filter(item => item.url !== url);
    this.set(filtered);
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear thumbnail cache:', error);
    }
  }

  static getCacheStats(): { size: number; totalSize: string } {
    const cache = this.get();
    const sizeInBytes = new Blob([JSON.stringify(cache)]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      size: cache.length,
      totalSize: `${sizeInKB} KB`
    };
  }
}
