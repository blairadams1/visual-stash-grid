
import { v4 as uuidv4 } from 'uuid';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  tags: string[];
  order: number;
  notes?: string;
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

export const createBookmark = (
  url: string,
  title: string,
  tags: string[],
  existingBookmarks: Bookmark[] = [],
  thumbnail?: string,
  notes?: string
): Bookmark => {
  // Find the highest order from existing bookmarks
  const highestOrder = existingBookmarks.length > 0
    ? Math.max(...existingBookmarks.map(b => b.order))
    : 0;

  // Create default thumbnail if none provided
  const defaultThumbnail = thumbnail || `https://www.google.com/s2/favicons?domain=${url}&sz=128`;
  
  return {
    id: uuidv4(),
    title,
    url,
    thumbnail: defaultThumbnail,
    tags,
    order: highestOrder + 1,
    notes,
  };
};
