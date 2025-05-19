
import { v4 as uuidv4 } from 'uuid';
import { Bookmark, Collection, Folder, Tag, TagCategory } from './types';

// Functions for creating items
export const createBookmark = (
  title: string,
  url: string,
  thumbnail?: string,
  tags: string[] = [],
  folderId?: string,
  existingItems: Array<Bookmark | Folder> = []
): Bookmark => {
  // Validate tags
  const validatedTags = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 15 && !tag.includes('.'))
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

  // Calculate the highest order value
  const highestOrder = existingItems.length > 0 
    ? Math.max(...existingItems.map(item => item.order || 0), 0)
    : 0;

  // Generate a thumbnail URL if none provided - use a service that captures the top of the page
  const defaultThumbnail = thumbnail || `https://image.thum.io/get/width/600/crop/800/viewportWidth/1200/noanimate/maxAge/1/${url}`;

  // Create the bookmark with current date as both dateAdded and createdAt
  const now = new Date().toISOString();
  
  // Create the bookmark
  return {
    id: `bookmark-${uuidv4()}`,
    title,
    url,
    thumbnail: defaultThumbnail,
    tags: validatedTags,
    order: highestOrder + 1,
    dateAdded: now,
    createdAt: now,
    folderId
  };
};

export const createCollection = (
  name: string,
  existingCollections: Collection[],
  parentId?: string,
  description?: string,
  color: string = '#D3E4FD'
): Collection => {
  // Find the highest order among existing collections
  const highestOrder = Math.max(...existingCollections.map(col => col.order || 0), 0);
  
  // Create the collection
  return {
    id: `collection-${uuidv4()}`,
    name,
    description,
    color,
    order: highestOrder + 1,
    parentId
  };
};

export const createFolder = (
  name: string,
  image: string = '/lovable-uploads/80ac03c8-9e22-4604-a202-1c5c73c568eb.png',
  tags: string[] = [],
  existingItems: Array<Bookmark | Folder> = [],
  parentId?: string
): Folder => {
  // Validate tags
  const validatedTags = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 15 && !tag.includes('.'))
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
    
  // Calculate the highest order value
  const highestOrder = existingItems.length > 0 
    ? Math.max(...existingItems.map(item => item.order || 0), 0)
    : 0;
  
  // Create the folder
  return {
    id: `folder-${uuidv4()}`,
    name,
    image,
    tags: validatedTags,
    order: highestOrder + 1,
    dateAdded: new Date().toISOString(),
    parentId
  };
};

export const createTag = (
  name: string,
  categoryId?: string,
  color?: string,
  parentTagId?: string
): Tag => {
  // Validate tag name
  const validatedName = name.trim().toLowerCase();

  if (validatedName.length === 0) {
    throw new Error("Tag name cannot be empty");
  }

  if (validatedName.length > 15) {
    throw new Error("Tag name cannot be longer than 15 characters");
  }

  if (validatedName.includes('.')) {
    throw new Error("Tag name cannot contain periods");
  }

  // Create the tag
  return {
    id: `tag-${uuidv4()}`,
    name: validatedName,
    categoryId,
    color,
    parentTagId
  };
};

export const createTagCategory = (
  name: string,
  color: string
): TagCategory => {
  return {
    id: `category-${uuidv4()}`,
    name,
    color
  };
};
