
import { v4 as uuidv4 } from 'uuid';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  tags: string[];
  order: number;
  createdAt: string;
}

// Common tags for automatic tagging
const designTags = ['design', 'ui/ux', 'inspiration', 'color', 'typography'];
const graphicsTags = ['graphics', 'illustration', 'animation', 'motion', 'photoshop', 'vector'];
const threeDTags = ['3d', 'modeling', 'rendering', 'blender', 'cinema4d', 'texture'];
const aiTags = ['ai', 'machine learning', 'generative', 'neural network', 'stable diffusion', 'midjourney'];
const devTags = ['development', 'code', 'programming', 'javascript', 'react', 'github'];
const contentTags = ['article', 'blog', 'reference', 'tutorial', 'documentation', 'guide'];
const socialTags = ['social', 'community', 'discussion', 'forum', 'networking', 'platform'];
const businessTags = ['business', 'marketing', 'startup', 'productivity', 'analytics', 'strategy'];

// All tag categories combined
const allTagCategories = [
  { category: 'Design', tags: designTags },
  { category: 'Graphics', tags: graphicsTags },
  { category: '3D', tags: threeDTags },
  { category: 'AI', tags: aiTags },
  { category: 'Development', tags: devTags },
  { category: 'Content', tags: contentTags },
  { category: 'Social', tags: socialTags },
  { category: 'Business', tags: businessTags }
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
  
  // Match domain-specific patterns
  if (url.includes('github.com') && tag === 'development') score += 8;
  if (url.includes('dribbble.com') && tag === 'design') score += 8;
  if (url.includes('behance.net') && tag === 'design') score += 8;
  if (url.includes('figma.com') && tag === 'ui/ux') score += 8;
  if (url.includes('codepen.io') && tag === 'development') score += 8;
  if (url.includes('shadcn') && tag === 'ui/ux') score += 8;
  if (url.includes('medium.com') && tag === 'article') score += 7;
  if (url.includes('youtube.com') && tag === 'tutorial') score += 6;
  if (url.includes('linkedin.com') && tag === 'social') score += 7;
  
  return score;
};

// Function to generate automatic tags based on URL and title
export const generateAutoTags = (url: string, title: string, maxTags = 3): string[] => {
  const combinedText = (url + ' ' + title).toLowerCase();
  const tagScores: { tag: string, score: number }[] = [];
  
  // Calculate scores for all possible tags
  allTagCategories.forEach(category => {
    category.tags.forEach(tag => {
      const score = calculateTagRelevance(tag, url, title);
      if (score > 0) {
        tagScores.push({ tag, score });
      }
    });
  });
  
  // Special case: Add domain-based tags if no tags were found
  if (tagScores.length === 0) {
    if (url.includes('github.com')) tagScores.push({ tag: 'development', score: 5 });
    if (url.includes('dribbble.com')) tagScores.push({ tag: 'design', score: 5 });
    if (url.includes('behance.net')) tagScores.push({ tag: 'design', score: 5 });
    if (url.includes('figma.com')) tagScores.push({ tag: 'ui/ux', score: 5 });
    if (url.includes('codepen.io')) tagScores.push({ tag: 'development', score: 5 });
    if (url.includes('shadcn')) tagScores.push({ tag: 'ui/ux', score: 5 });
    if (url.includes('medium.com')) tagScores.push({ tag: 'article', score: 5 });
    if (url.includes('youtube.com')) tagScores.push({ tag: 'tutorial', score: 5 });
    if (url.includes('linkedin.com')) tagScores.push({ tag: 'social', score: 5 });
  }
  
  // Sort tags by score and take the top N
  const sortedTags = tagScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.tag);
  
  // Remove duplicates and limit to maxTags
  return Array.from(new Set(sortedTags)).slice(0, maxTags);
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
  bookmarks: Bookmark[]
): Bookmark => {
  // Generate auto tags (limited to 3)
  const autoTags = generateAutoTags(url, title, 3);
  
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
    createdAt: new Date().toISOString()
  };
};
