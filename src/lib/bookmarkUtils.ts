import { v4 as uuidv4 } from 'uuid';
import { getIntelligentThumbnail, getThumbnailSettings } from './intelligentThumbnail';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  tags: string[];
  order: number;
  notes?: string;
  collectionId?: string;
  createdAt?: Date;
  folderId?: string; // New property to indicate if bookmark is in a folder
}

export interface Folder {
  id: string;
  name: string;
  image: string;
  tags: string[];
  order: number;
  collectionId?: string;
  createdAt?: Date;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  categoryId?: string;
  color?: string;
  parentTagId?: string;
}

export interface TagCategory {
  id: string;
  name: string;
  color: string;
}

export const generatePlaceholderThumbnail = () => {
  // Generate a random color for the placeholder
  const colors = [
    '#4285F4', // blue
    '#34A853', // green
    '#FBBC05', // yellow
    '#EA4335', // red
    '#8AB4F8', // light blue
    '#4CAF50', // medium green
    '#FFA000', // orange
    '#DB4437', // dark red
    '#673AB7', // purple
    '#FF5722', // deep orange
  ];
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Return a data URL for a simple colored SVG
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='${color.replace('#', '%23')}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='42' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🔖%3C/text%3E%3C/svg%3E`;
};

export const createBookmark = async (
  url: string,
  title: string,
  tags: string[],
  existingBookmarks: Bookmark[] = [],
  collectionId?: string,
  customThumbnail?: string,
  notes?: string,
  folderId?: string
): Promise<Bookmark> => {
  // Find the highest order from existing bookmarks
  const highestOrder = existingBookmarks.length > 0
    ? Math.max(...existingBookmarks.map(b => b.order))
    : 0;

  let thumbnail = customThumbnail;
  
  // Generate intelligent thumbnail if no custom thumbnail provided
  if (!customThumbnail) {
    try {
      const settings = getThumbnailSettings();
      const result = await getIntelligentThumbnail(url, title, settings);
      thumbnail = result.thumbnail;
      console.log(`Generated ${result.type} thumbnail for ${url} (${result.source})`);
    } catch (error) {
      console.error('Failed to generate intelligent thumbnail:', error);
      // Fallback to simple favicon
      thumbnail = `https://www.google.com/s2/favicons?domain=${url}&sz=128`;
    }
  }
  
  return {
    id: uuidv4(),
    title,
    url,
    thumbnail: thumbnail || generatePlaceholderThumbnail(),
    tags,
    order: highestOrder + 1,
    notes,
    collectionId,
    createdAt: new Date(),
    folderId,
  };
};

export const createFolder = (
  name: string,
  existingItems: (Bookmark | Folder)[] = [],
  image?: string,
  tags: string[] = [],
  collectionId?: string
): Folder => {
  // Find the highest order from existing items
  const highestOrder = existingItems.length > 0
    ? Math.max(...existingItems.map(item => item.order))
    : 0;

  // Use default folder image if none provided
  const defaultImage = image || '/lovable-uploads/80ac03c8-9e22-4604-a202-1c5c73c568eb.png';
  
  return {
    id: uuidv4(),
    name,
    image: defaultImage,
    tags,
    order: highestOrder + 1,
    collectionId,
    createdAt: new Date(),
  };
};

// Generate default collections
export const getDefaultCollections = (): Collection[] => {
  return [
    {
      id: uuidv4(),
      name: 'My Bookmarks',
      description: 'Default collection for all your bookmarks',
      color: '#4285F4',
      order: 0,
    },
    {
      id: uuidv4(),
      name: 'Work',
      description: 'Work-related bookmarks',
      color: '#34A853',
      order: 1,
    },
    {
      id: uuidv4(),
      name: 'Personal',
      description: 'Personal bookmarks',
      color: '#FBBC05',
      order: 2,
    }
  ];
};

// Create a new collection
export const createCollection = (
  name: string, 
  existingCollections: Collection[] = [],
  parentId?: string,
  description?: string,
  color?: string
): Collection => {
  // Find the highest order from existing collections
  const highestOrder = existingCollections.length > 0
    ? Math.max(...existingCollections.map(c => c.order))
    : 0;
    
  return {
    id: uuidv4(),
    name,
    description,
    color: color || '#4285F4',
    parentId,
    order: highestOrder + 1,
  };
};

// Function to generate default tag categories
export const getDefaultTagCategories = (): TagCategory[] => {
  return [
    {
      id: uuidv4(),
      name: 'Work',
      color: '#4285F4',
    },
    {
      id: uuidv4(),
      name: 'Personal',
      color: '#34A853',
    },
    {
      id: uuidv4(),
      name: 'Education',
      color: '#FBBC05',
    }
  ];
};

// Create a new tag
export const createTag = (
  name: string, 
  categoryId?: string,
  color?: string,
  parentTagId?: string
): Tag => {
  return {
    id: uuidv4(),
    name,
    categoryId,
    color: color || '#4285F4',
    parentTagId,
  };
};

// Create a new tag category
export const createTagCategory = (
  name: string,
  color: string
): TagCategory => {
  return {
    id: uuidv4(),
    name,
    color,
  };
};

// Generate auto tags based on URL and title
export const generateAutoTags = (url: string, title: string, limit: number = 3): { tags: string[] } => {
  const combinedText = `${url} ${title}`.toLowerCase();
  
  // Common keywords to detect
  const keywordMap: Record<string, string[]> = {
    'dev': ['github', 'stackoverflow', 'gitlab', 'dev', 'code', 'programming'],
    'social': ['twitter', 'facebook', 'instagram', 'linkedin', 'social'],
    'video': ['youtube', 'vimeo', 'video', 'stream', 'watch'],
    'shop': ['amazon', 'ebay', 'shop', 'store', 'buy'],
    'news': ['news', 'article', 'blog', 'post'],
    'docs': ['docs', 'documentation', 'guide', 'tutorial', 'learn'],
  };
  
  const tags: string[] = [];
  
  // Extract domain as a potential tag
  try {
    const domain = new URL(url).hostname
      .replace('www.', '')
      .split('.')
      .slice(0, -1)
      .join('.');
    
    if (domain && !['com', 'org', 'net', 'io'].includes(domain)) {
      tags.push(domain);
    }
  } catch (e) {
    // Invalid URL, skip domain extraction
  }
  
  // Match keywords
  Object.entries(keywordMap).forEach(([category, keywords]) => {
    if (tags.length < limit && keywords.some(keyword => combinedText.includes(keyword))) {
      tags.push(category);
    }
  });
  
  // Fill remaining slots with common words from title
  if (tags.length < limit && title) {
    const words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !tags.includes(word))
      .slice(0, limit - tags.length);
    
    tags.push(...words);
  }
  
  return { tags };
};
