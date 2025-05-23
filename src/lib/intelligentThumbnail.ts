
// Main intelligent thumbnail system that coordinates all components
import { extractDomain, getDomainInfo } from './domainIntelligence';
import { detectCategory } from './categoryDetection';
import { generateSVGThumbnail, generateCategoryThumbnail } from './thumbnailTemplates';
import { ThumbnailCache } from './thumbnailCache';

export interface ThumbnailResult {
  thumbnail: string;
  type: 'intelligent' | 'favicon' | 'placeholder';
  source: 'cache' | 'generated' | 'fallback';
}

export interface ThumbnailSettings {
  enableIntelligentThumbnails: boolean;
  fallbackToFavicon: boolean;
  cacheEnabled: boolean;
}

export const getIntelligentThumbnail = async (
  url: string,
  title: string,
  settings: ThumbnailSettings = {
    enableIntelligentThumbnails: true,
    fallbackToFavicon: true,
    cacheEnabled: true
  }
): Promise<ThumbnailResult> => {
  // Check cache first if enabled
  if (settings.cacheEnabled) {
    const cached = ThumbnailCache.getCachedThumbnail(url);
    if (cached) {
      return {
        thumbnail: cached.thumbnail,
        type: cached.type,
        source: 'cache'
      };
    }
  }

  // Extract domain for analysis
  const domain = extractDomain(url);
  if (!domain) {
    return getFallbackThumbnail(url, title, settings);
  }

  if (!settings.enableIntelligentThumbnails) {
    return getFallbackThumbnail(url, title, settings);
  }

  // Try to get domain-specific information
  const domainInfo = getDomainInfo(domain);
  
  // If we have specific domain info, use it
  if (domainInfo) {
    const thumbnail = generateSVGThumbnail(domain, title, domainInfo);
    
    if (settings.cacheEnabled) {
      ThumbnailCache.addCachedThumbnail(url, thumbnail, domain, 'intelligent', domainInfo.category);
    }
    
    return {
      thumbnail,
      type: 'intelligent',
      source: 'generated'
    };
  }

  // Try to detect category from URL and title
  const categoryInfo = detectCategory(url, title);
  if (categoryInfo) {
    const thumbnail = generateCategoryThumbnail(categoryInfo, domain);
    
    if (settings.cacheEnabled) {
      ThumbnailCache.addCachedThumbnail(url, thumbnail, domain, 'intelligent', categoryInfo.name);
    }
    
    return {
      thumbnail,
      type: 'intelligent',
      source: 'generated'
    };
  }

  // Fallback to favicon or placeholder
  return getFallbackThumbnail(url, title, settings);
};

const getFallbackThumbnail = async (
  url: string,
  title: string,
  settings: ThumbnailSettings
): Promise<ThumbnailResult> => {
  const domain = extractDomain(url);

  if (settings.fallbackToFavicon && domain) {
    // Try higher quality favicon with better fallback
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    
    try {
      // Test if favicon loads
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Check if the favicon has reasonable dimensions (not 1x1 or very small)
          if (img.naturalWidth > 16 && img.naturalHeight > 16) {
            resolve();
          } else {
            reject();
          }
        };
        img.onerror = () => reject();
        img.src = faviconUrl;
      });

      if (settings.cacheEnabled) {
        ThumbnailCache.addCachedThumbnail(url, faviconUrl, domain, 'favicon');
      }

      return {
        thumbnail: faviconUrl,
        type: 'favicon',
        source: 'fallback'
      };
    } catch {
      // Favicon failed, use our improved placeholder
    }
  }

  // Generate high-quality SVG placeholder thumbnail
  const thumbnail = generateSVGThumbnail(domain || 'website', title);
  
  if (settings.cacheEnabled) {
    ThumbnailCache.addCachedThumbnail(url, thumbnail, domain || 'unknown', 'placeholder');
  }

  return {
    thumbnail,
    type: 'placeholder',
    source: 'fallback'
  };
};

// Utility function to preload thumbnails for multiple bookmarks
export const preloadThumbnails = async (
  bookmarks: Array<{ url: string; title: string }>,
  settings: ThumbnailSettings,
  onProgress?: (completed: number, total: number) => void
): Promise<void> => {
  let completed = 0;
  const total = bookmarks.length;

  const promises = bookmarks.map(async (bookmark) => {
    await getIntelligentThumbnail(bookmark.url, bookmark.title, settings);
    completed++;
    onProgress?.(completed, total);
  });

  await Promise.all(promises);
};

// Get thumbnail settings from localStorage
export const getThumbnailSettings = (): ThumbnailSettings => {
  try {
    const stored = localStorage.getItem('thumbnailSettings');
    const defaults: ThumbnailSettings = {
      enableIntelligentThumbnails: true,
      fallbackToFavicon: true,
      cacheEnabled: true
    };
    
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return {
      enableIntelligentThumbnails: true,
      fallbackToFavicon: true,
      cacheEnabled: true
    };
  }
};

// Save thumbnail settings to localStorage
export const saveThumbnailSettings = (settings: ThumbnailSettings): void => {
  try {
    localStorage.setItem('thumbnailSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save thumbnail settings:', error);
  }
};
