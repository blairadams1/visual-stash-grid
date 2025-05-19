
import { Bookmark, Folder } from '@/lib/types';
import { createBookmark, createFolder } from '@/lib/createUtils';
import { validateBookmarkData, validateFolderData } from './validationUtils';
import { validateAndSanitizeUrl, generateThumbnail } from './urlUtils';

// Type definitions for validation
export interface BookmarkData {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
  order?: number;
  dateAdded?: string;
  notes?: string;
  collectionId?: string;
  folderId?: string;
  createdAt?: string;
}

export interface FolderData {
  id?: string;
  name: string;
  image?: string;
  tags?: string[];
  parentId?: string;
  order?: number;
}

export interface ImportData {
  version?: string;
  bookmarks: BookmarkData[];
  folders?: FolderData[];
  metadata?: {
    exportDate?: string;
    applicationVersion?: string;
    totalBookmarks?: number;
    totalFolders?: number;
  };
}

// Process imported JSON bookmarks with improved validation
export const processJSONBookmarks = (jsonData: any) => {
  try {
    // Basic structure validation
    if (!jsonData || typeof jsonData !== 'object') {
      return {
        bookmarks: [],
        folders: [],
        error: 'Invalid JSON format: data must be an object'
      };
    }

    if (!Array.isArray(jsonData.bookmarks)) {
      return {
        bookmarks: [],
        folders: [],
        error: 'Invalid JSON format: bookmarks must be an array'
      };
    }

    const importedBookmarks: Bookmark[] = [];
    const importedFolders: Folder[] = [];
    const validationErrors: string[] = [];
    
    // Process folders first if they exist
    if (jsonData.folders && Array.isArray(jsonData.folders)) {
      jsonData.folders.forEach((folder: any, index: number) => {
        const { isValid, errors } = validateFolderData(folder);
        if (!isValid) {
          validationErrors.push(`Folder at index ${index} is invalid: ${errors.join(', ')}`);
          return;
        }
        
        const newFolder = createFolder(
          folder.name,
          folder.image,
          folder.tags,
          folder.parentId
        );
        importedFolders.push(newFolder);
      });
    }
    
    // Process bookmarks
    jsonData.bookmarks.forEach((bookmark: any, index: number) => {
      const { isValid, errors } = validateBookmarkData(bookmark);
      if (!isValid) {
        validationErrors.push(`Bookmark at index ${index} is invalid: ${errors.join(', ')}`);
        return;
      }
      
      // Validate and sanitize URL
      const sanitizedUrl = validateAndSanitizeUrl(bookmark.url);
      if (!sanitizedUrl) {
        validationErrors.push(`Bookmark at index ${index} has invalid URL format: ${bookmark.url}`);
        return;
      }
      
      // Create the bookmark
      const newBookmark = createBookmark(
        bookmark.title,
        sanitizedUrl,
        bookmark.thumbnail || generateThumbnail(sanitizedUrl),
        bookmark.tags || [],
        bookmark.folderId
      );
      
      importedBookmarks.push(newBookmark);
    });
    
    return {
      bookmarks: importedBookmarks,
      folders: importedFolders,
      error: validationErrors.length > 0 
        ? `Import completed with ${validationErrors.length} validation errors: ${validationErrors.join('; ')}`
        : null
    };
  } catch (error) {
    console.error('Error processing JSON bookmarks:', error);
    return {
      bookmarks: [],
      folders: [],
      error: `Failed to process JSON bookmarks: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
