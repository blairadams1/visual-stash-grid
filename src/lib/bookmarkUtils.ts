
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

// Function to generate automatic tags based on URL and title
export const generateAutoTags = (url: string, title: string): string[] => {
  const combinedText = (url + ' ' + title).toLowerCase();
  const tags: string[] = [];

  // Check against each category
  designTags.forEach(tag => {
    if (combinedText.includes(tag.toLowerCase())) {
      tags.push(tag);
    }
  });

  graphicsTags.forEach(tag => {
    if (combinedText.includes(tag.toLowerCase())) {
      tags.push(tag);
    }
  });

  threeDTags.forEach(tag => {
    if (combinedText.includes(tag.toLowerCase())) {
      tags.push(tag);
    }
  });

  aiTags.forEach(tag => {
    if (combinedText.includes(tag.toLowerCase())) {
      tags.push(tag);
    }
  });

  devTags.forEach(tag => {
    if (combinedText.includes(tag.toLowerCase())) {
      tags.push(tag);
    }
  });

  // Check for common domains
  if (url.includes('behance.net')) tags.push('design');
  if (url.includes('dribbble.com')) tags.push('design');
  if (url.includes('github.com')) tags.push('development');
  if (url.includes('figma.com')) tags.push('ui/ux');
  if (url.includes('codepen.io')) tags.push('development');
  if (url.includes('shadcn')) tags.push('ui/ux');
  
  // Remove duplicates
  return Array.from(new Set(tags));
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
  // Generate auto tags
  const autoTags = generateAutoTags(url, title);
  
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
