
import { v4 as uuidv4 } from 'uuid';

export interface TagCategory {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  categoryId?: string; // Optional reference to a category
  color?: string; // Optional custom color
  parentTagId?: string; // Optional parent tag for hierarchical tags
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string; // For nested collections
  color?: string;
  createdAt: string;
  order: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  tags: string[]; // We'll keep this as string[] for backward compatibility
  order: number;
  createdAt: string;
  collectionId?: string; // Optional reference to a collection
}

// Tag categories and their colors
export const defaultTagCategories: Record<string, string> = {
  'Design': '#9b87f5', // Primary Purple
  'Graphics': '#7E69AB', // Secondary Purple
  'Development': '#0EA5E9', // Ocean Blue
  '3D': '#6E59A5', // Tertiary Purple
  'AI': '#D946EF', // Magenta Pink
  'Content': '#F97316', // Bright Orange  
  'Social': '#33C3F0', // Sky Blue
  'Business': '#1EAEDB', // Bright Blue
  'Personal': '#F2FCE2', // Soft Green
  'Work': '#FEF7CD', // Soft Yellow
  'Education': '#FEC6A1', // Soft Orange
  'Entertainment': '#E5DEFF', // Soft Purple
  'Shopping': '#FFDEE2', // Soft Pink
  'Finance': '#FDE1D3', // Soft Peach
  'Health': '#D3E4FD', // Soft Blue
  'Travel': '#8B5CF6', // Vivid Purple
};

// Common tags for automatic tagging (expanded)
const designTags = ['design', 'ui/ux', 'inspiration', 'color', 'typography', 'user interface', 'web design', 'responsive', 'wireframe', 'prototype'];
const graphicsTags = ['graphics', 'illustration', 'animation', 'motion', 'photoshop', 'vector', 'logo', 'branding', 'digital art', 'creative'];
const threeDTags = ['3d', 'modeling', 'rendering', 'blender', 'cinema4d', 'texture', 'sculpting', 'animation', 'vfx', 'unity', 'unreal engine'];
const aiTags = ['ai', 'machine learning', 'generative', 'neural network', 'stable diffusion', 'midjourney', 'gpt', 'chatgpt', 'artificial intelligence', 'data science'];
const devTags = ['development', 'code', 'programming', 'javascript', 'react', 'github', 'typescript', 'python', 'api', 'framework', 'library', 'backend', 'frontend'];
const contentTags = ['article', 'blog', 'reference', 'tutorial', 'documentation', 'guide', 'ebook', 'video', 'podcast', 'newsletter', 'research'];
const socialTags = ['social', 'community', 'discussion', 'forum', 'networking', 'platform', 'twitter', 'linkedin', 'discord', 'slack', 'reddit'];
const businessTags = ['business', 'marketing', 'startup', 'productivity', 'analytics', 'strategy', 'finance', 'saas', 'ecommerce', 'sales'];
const personalTags = ['personal', 'hobby', 'interest', 'home', 'family', 'health', 'fitness', 'food', 'travel', 'lifestyle'];
const workTags = ['work', 'job', 'career', 'professional', 'meeting', 'project', 'task', 'colleague', 'remote', 'office'];
const educationTags = ['education', 'course', 'learning', 'study', 'university', 'school', 'college', 'academic', 'research', 'knowledge'];
const entertainmentTags = ['entertainment', 'movie', 'music', 'game', 'streaming', 'video', 'tv', 'show', 'anime', 'podcast'];
const shoppingTags = ['shopping', 'ecommerce', 'product', 'store', 'deal', 'review', 'price', 'comparison', 'wishlist', 'amazon'];
const financeTags = ['finance', 'banking', 'investment', 'stock', 'crypto', 'budget', 'tax', 'insurance', 'retirement', 'saving'];
const healthTags = ['health', 'medical', 'fitness', 'nutrition', 'wellness', 'workout', 'diet', 'mental health', 'meditation', 'yoga'];
const travelTags = ['travel', 'destination', 'hotel', 'flight', 'vacation', 'tourism', 'guide', 'adventure', 'backpacking', 'booking'];

// Domain-specific auto-tagging rules
const domainTagMapping: Record<string, { category: string, tags: string[] }> = {
  'github.com': { category: 'Development', tags: ['development', 'code', 'repository', 'git'] },
  'stackoverflow.com': { category: 'Development', tags: ['development', 'programming', 'coding help', 'q&a'] },
  'dribbble.com': { category: 'Design', tags: ['design', 'inspiration', 'ui/ux'] },
  'behance.net': { category: 'Design', tags: ['design', 'portfolio', 'creative'] },
  'figma.com': { category: 'Design', tags: ['ui/ux', 'design tool', 'prototype'] },
  'medium.com': { category: 'Content', tags: ['article', 'blog', 'reading'] },
  'dev.to': { category: 'Development', tags: ['development', 'programming', 'coding'] },
  'youtube.com': { category: 'Entertainment', tags: ['video', 'tutorial', 'content'] },
  'linkedin.com': { category: 'Social', tags: ['professional', 'networking', 'career'] },
  'twitter.com': { category: 'Social', tags: ['social media', 'news', 'networking'] },
  'notion.so': { category: 'Productivity', tags: ['notes', 'productivity', 'organization'] },
  'amazon.com': { category: 'Shopping', tags: ['ecommerce', 'shopping', 'products'] },
  'coursera.org': { category: 'Education', tags: ['course', 'learning', 'online education'] },
  'udemy.com': { category: 'Education', tags: ['course', 'tutorial', 'learning'] },
  'netflix.com': { category: 'Entertainment', tags: ['streaming', 'tv shows', 'movies'] },
  'spotify.com': { category: 'Entertainment', tags: ['music', 'podcast', 'audio'] },
  'airbnb.com': { category: 'Travel', tags: ['accommodation', 'travel', 'vacation'] },
  'trello.com': { category: 'Productivity', tags: ['project management', 'organization', 'tasks'] },
  'docs.google.com': { category: 'Productivity', tags: ['document', 'collaboration', 'work'] },
  'gmail.com': { category: 'Communication', tags: ['email', 'communication', 'personal'] },
  'pinterest.com': { category: 'Social', tags: ['inspiration', 'images', 'ideas'] },
  'instagram.com': { category: 'Social', tags: ['social media', 'photos', 'personal'] },
  'facebook.com': { category: 'Social', tags: ['social media', 'networking', 'personal'] },
  'reddit.com': { category: 'Social', tags: ['forum', 'discussions', 'community'] },
  'wikipedia.org': { category: 'Reference', tags: ['information', 'encyclopedia', 'research'] },
  'maps.google.com': { category: 'Travel', tags: ['maps', 'directions', 'location'] },
  'news.ycombinator.com': { category: 'Technology', tags: ['tech news', 'startup', 'programming'] },
};

// All tag categories combined
const allTagCategories = [
  { category: 'Design', tags: designTags },
  { category: 'Graphics', tags: graphicsTags },
  { category: '3D', tags: threeDTags },
  { category: 'AI', tags: aiTags },
  { category: 'Development', tags: devTags },
  { category: 'Content', tags: contentTags },
  { category: 'Social', tags: socialTags },
  { category: 'Business', tags: businessTags },
  { category: 'Personal', tags: personalTags },
  { category: 'Work', tags: workTags },
  { category: 'Education', tags: educationTags },
  { category: 'Entertainment', tags: entertainmentTags },
  { category: 'Shopping', tags: shoppingTags },
  { category: 'Finance', tags: financeTags },
  { category: 'Health', tags: healthTags },
  { category: 'Travel', tags: travelTags },
];

// Function to calculate relevance score for a tag based on URL and title
const calculateTagRelevance = (tag: string, url: string, title: string): number => {
  const combinedText = (url + ' ' + title).toLowerCase();
  let score = 0;
  
  // Direct match in URL or title
  if (combinedText.includes(tag.toLowerCase())) {
    score += 10;
    
    // Boost score for exact word matches (not just substring)
    const words = combinedText.split(/[\s\-\_\.\,\;\:\/\?\=\&]+/);
    if (words.includes(tag.toLowerCase())) {
      score += 5;
    }
  }
  
  // Domain-specific matching
  const domain = extractDomain(url);
  if (domain && domainTagMapping[domain]) {
    if (domainTagMapping[domain].tags.includes(tag)) {
      score += 12;  // Higher score for domain-specific tag matches
    }
  }
  
  return score;
};

// Extract domain from URL
const extractDomain = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
};

// Function to determine category from tags
export const determineCategoryFromTags = (tags: string[]): string | null => {
  const categoryScores: Record<string, number> = {};
  
  tags.forEach(tag => {
    allTagCategories.forEach(category => {
      if (category.tags.includes(tag)) {
        categoryScores[category.category] = (categoryScores[category.category] || 0) + 1;
      }
    });
  });
  
  let highestScore = 0;
  let bestCategory: string | null = null;
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  });
  
  return bestCategory;
};

// Function to generate automatic tags based on URL and title
export const generateAutoTags = (url: string, title: string, maxTags = 5): { tags: string[], category: string | null } => {
  const combinedText = (url + ' ' + title).toLowerCase();
  const tagScores: { tag: string, score: number }[] = [];
  
  // Check if domain has specific tag mapping
  const domain = extractDomain(url);
  if (domain && domainTagMapping[domain]) {
    // Add domain-specific tags with high score
    domainTagMapping[domain].tags.forEach(tag => {
      tagScores.push({ tag, score: 15 }); // Higher score for domain-specific tags
    });
  }
  
  // Calculate scores for all possible tags
  allTagCategories.forEach(category => {
    category.tags.forEach(tag => {
      const score = calculateTagRelevance(tag, url, title);
      if (score > 0) {
        tagScores.push({ tag, score });
      }
    });
  });

  // Sort tags by score and take the top N
  const sortedTags = tagScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.tag);
  
  // Remove duplicates and limit to maxTags
  const uniqueTags = Array.from(new Set(sortedTags)).slice(0, maxTags);
  
  // Determine the best category for these tags
  const bestCategory = determineCategoryFromTags(uniqueTags);
  
  return { 
    tags: uniqueTags,
    category: bestCategory 
  };
};

// Generate a placeholder thumbnail if needed
export const generatePlaceholderThumbnail = (): string => {
  const placeholders = [
    `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b`,
    `https://images.unsplash.com/photo-1461749280684-dccba630e2f6`,
    `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d`,
    `https://images.unsplash.com/photo-1518770660439-4636190af475`,
    `https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7`
  ];
  
  // Select a random placeholder
  return placeholders[Math.floor(Math.random() * placeholders.length)];
};

// Create a new bookmark
export const createBookmark = (
  url: string,
  title: string,
  customTags: string[] = [],
  bookmarks: Bookmark[],
  collectionId?: string
): Bookmark => {
  // Generate auto tags and category
  const { tags: autoTags, category } = generateAutoTags(url, title, 5);
  
  // Combine auto and custom tags
  const allTags = [...new Set([...autoTags, ...customTags])];
  
  // Try to get a screenshot from a service like Microlink
  const thumbnailUrl = `https://image.thum.io/get/width/400/crop/800/noanimate/maxAge/24/${url}`;
  
  // Create new bookmark
  return {
    id: uuidv4(),
    url,
    title,
    thumbnail: thumbnailUrl,
    tags: allTags,
    order: bookmarks.length,
    createdAt: new Date().toISOString(),
    collectionId // Optional collection ID
  };
};

// Create a default collection structure
export const getDefaultCollections = (): Collection[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'personal',
      name: 'Personal',
      description: 'Personal bookmarks',
      color: '#F2FCE2', // Soft Green
      createdAt: now,
      order: 0
    },
    {
      id: 'work',
      name: 'Work',
      description: 'Work-related bookmarks',
      color: '#FEF7CD', // Soft Yellow
      createdAt: now,
      order: 1
    }
  ];
};

// Create a new collection
export const createCollection = (
  name: string,
  collections: Collection[],
  parentId?: string,
  description?: string,
  color?: string
): Collection => {
  return {
    id: uuidv4(),
    name,
    description,
    color: color || '#D3E4FD', // Default to Soft Blue if no color provided
    parentId,
    createdAt: new Date().toISOString(),
    order: collections.length,
  };
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
    color,
    parentTagId
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
    color
  };
};

// Get default tag categories
export const getDefaultTagCategories = (): TagCategory[] => {
  return Object.entries(defaultTagCategories).map(([name, color]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    color
  }));
};
