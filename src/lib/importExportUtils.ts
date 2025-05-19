
import { Bookmark, Folder, createBookmark, createFolder } from '@/lib/bookmarkUtils';

// Type definitions for validation
interface BookmarkData {
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

interface FolderData {
  id?: string;
  name: string;
  image?: string;
  tags?: string[];
  parentId?: string;
  order?: number;
}

interface ImportData {
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

// Helper function to validate and sanitize URLs
const validateAndSanitizeUrl = (url: string): string | null => {
  try {
    // Basic URL validation
    const parsedUrl = new URL(url);
    
    // Check for common protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    // Sanitize the URL
    return parsedUrl.toString();
  } catch (e) {
    return null;
  }
};

// Helper function to validate HTML structure
const validateHtmlStructure = (html: string): boolean => {
  const requiredElements = ['<DL>', '<DT>', '<A'];
  return requiredElements.every(element => html.includes(element));
};

// Helper function to validate bookmark data
const validateBookmarkData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (!data.url || typeof data.url !== 'string') {
    errors.push('URL is required and must be a string');
  } else {
    const sanitizedUrl = validateAndSanitizeUrl(data.url);
    if (!sanitizedUrl) {
      errors.push('Invalid URL format');
    }
  }
  
  if (data.tags && (!Array.isArray(data.tags) || !data.tags.every((tag: any) => typeof tag === 'string'))) {
    errors.push('Tags must be an array of strings');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to validate folder data
const validateFolderData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Folder name is required and must be a non-empty string');
  }
  
  if (data.tags && (!Array.isArray(data.tags) || !data.tags.every((tag: any) => typeof tag === 'string'))) {
    errors.push('Tags must be an array of strings');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate thumbnail based on URL
export const generateThumbnail = (url: string): string => {
  // Try to extract domain for favicon
  try {
    const domain = new URL(url).hostname;
    // Return a fallback image or try to get favicon
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    // Return a placeholder image if URL is invalid
    return `https://via.placeholder.com/300x200/f0f0f0/808080?text=${encodeURIComponent(url)}`;
  }
};

// Generate automatic tags based on URL and title
export const generateAutomaticTags = (url: string, title: string): string[] => {
  const tags = new Set<string>();
  
  // Extract domain as a tag
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const domainParts = domain.split('.');
    if (domainParts.length > 0) {
      tags.add(domainParts[0]); // Add the main domain name as a tag
    }
  } catch (e) {
    // Skip if URL is invalid
  }
  
  // Extract key words from title
  if (title) {
    // Split the title into words
    const words = title.toLowerCase().split(/\s+/);
    
    // Common words to filter out
    const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
    
    // Add meaningful words from title as tags (if they're at least 4 characters)
    words.forEach(word => {
      // Clean the word of special characters
      const cleanWord = word.replace(/[^\w\s]/gi, '');
      if (cleanWord.length >= 4 && !commonWords.has(cleanWord)) {
        tags.add(cleanWord);
      }
    });
  }
  
  // Add category tags based on URL patterns
  if (url.includes('github.com')) tags.add('developer');
  if (url.includes('youtube.com') || url.includes('vimeo.com')) tags.add('video');
  if (url.includes('docs.google.com')) tags.add('document');
  if (url.includes('medium.com') || url.includes('blog')) tags.add('blog');
  
  // Limit to 3-4 tags and convert Set back to array
  return Array.from(tags).slice(0, 4);
};

// Parse HTML bookmarks file with improved validation
export const parseHTMLBookmarks = (html: string) => {
  console.log('Starting HTML bookmark parsing...');
  
  // Validate HTML structure
  if (!validateHtmlStructure(html)) {
    return {
      bookmarks: [],
      folders: [],
      error: "Invalid HTML bookmark file structure. Missing required elements."
    };
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        bookmarks: [],
        folders: [],
        error: "Failed to parse HTML bookmark file. The file may be corrupted."
      };
    }
    
    const importedBookmarks: Bookmark[] = [];
    const importedFolders: Map<string, Folder> = new Map();
    const folderRelationships: Map<string, string> = new Map();
    const validationErrors: string[] = [];
    
    // Initialize folderIdMap to track folder ID conversions
    const folderIdMap = new Map<string, string>();
    
    // First find all folders (DT elements with H3 and DL)
    const findFolders = () => {
      console.log('Finding folders...');
      
      const folderItems = Array.from(doc.querySelectorAll('dt'));
      console.log(`Found ${folderItems.length} potential folder elements`);
      
      folderItems.forEach((dt, index) => {
        const h3 = dt.querySelector('h3');
        const dl = dt.querySelector('dl');
        
        if (h3 && dl) {
          const folderName = h3.textContent?.trim() || `Imported Folder ${index}`;
          
          // Validate folder name
          if (!folderName) {
            validationErrors.push(`Folder at index ${index} has no name`);
            return;
          }
          
          const folderId = `folder-${Math.random().toString(36).substr(2, 9)}`;
          const newFolder = createFolder(folderName);
          
          importedFolders.set(folderId, newFolder);
          folderIdMap.set(folderId, newFolder.id);
          dl.setAttribute('data-folder-id', folderId);
          
          const parentDL = findParentDL(dt);
          if (parentDL) {
            const parentFolderId = parentDL.getAttribute('data-folder-id');
            if (parentFolderId) {
              folderRelationships.set(folderId, parentFolderId);
            }
          }
        }
      });
    };
    
    // Helper function to find parent DL element
    const findParentDL = (element: Element): Element | null => {
      let parent = element.parentElement;
      while (parent) {
        if (parent.tagName === 'DL' && parent.hasAttribute('data-folder-id')) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };
    
    // Process folder relationships
    const processFolderRelationships = () => {
      folderRelationships.forEach((parentId, childId) => {
        const childFolder = importedFolders.get(childId);
        const parentFolder = importedFolders.get(parentId);
        
        if (childFolder && parentFolder) {
          childFolder.parentId = parentFolder.id;
        }
      });
    };
    
    // Find and validate all bookmarks
    const findBookmarks = () => {
      console.log('Finding bookmarks...');
      const links = doc.querySelectorAll('a');
      console.log(`Found ${links.length} links in HTML`);
      
      links.forEach((link, index) => {
        const url = link.getAttribute('href');
        
        // Skip invalid URLs
        if (!url || url.startsWith('javascript:') || url === '#') {
          validationErrors.push(`Bookmark at index ${index} has invalid URL: ${url}`);
          return;
        }
        
        // Validate and sanitize URL
        const sanitizedUrl = validateAndSanitizeUrl(url);
        if (!sanitizedUrl) {
          validationErrors.push(`Bookmark at index ${index} has invalid URL format: ${url}`);
          return;
        }
        
        const title = link.textContent?.trim() || sanitizedUrl;
        
        // Get and validate tags
        const tagsAttr = link.getAttribute('tags') || '';
        let tags: string[] = tagsAttr ? tagsAttr.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        // Generate automatic tags if needed
        if (tags.length < 3) {
          const generatedTags = generateAutomaticTags(sanitizedUrl, title);
          tags = [...new Set([...tags, ...generatedTags])];
        }
        
        const thumbnail = generateThumbnail(sanitizedUrl);
        
        // Find and validate parent folder
        let folderId: string | undefined = undefined;
        const parentDT = link.closest('dt');
        if (parentDT) {
          const parentDL = findParentDL(parentDT);
          if (parentDL) {
            const folderDataId = parentDL.getAttribute('data-folder-id');
            if (folderDataId && importedFolders.has(folderDataId)) {
              // Use the mapped ID from our folderIdMap
              folderId = folderIdMap.get(folderDataId);
            }
          }
        }
        
        // Create the bookmark
        const newBookmark = createBookmark(
          title,
          sanitizedUrl,
          thumbnail,
          tags,
          folderId
        );
        
        importedBookmarks.push(newBookmark);
      });
    };
    
    // Process the document
    findFolders();
    processFolderRelationships();
    findBookmarks();
    
    // Log stats about what we found
    console.log(`HTML parsing complete: Found ${importedBookmarks.length} bookmarks and ${importedFolders.size} folders`);
    
    // Convert folders to array
    const folderArray = Array.from(importedFolders.values());
    
    // Return results with any validation errors
    return {
      bookmarks: importedBookmarks,
      folders: folderArray,
      error: validationErrors.length > 0 
        ? `Import completed with ${validationErrors.length} validation errors: ${validationErrors.join('; ')}`
        : importedBookmarks.length === 0 && folderArray.length === 0 
          ? "No valid bookmarks or folders found in the HTML"
          : null
    };
  } catch (error) {
    console.error('Error parsing HTML bookmarks:', error);
    return {
      bookmarks: [],
      folders: [],
      error: `Failed to parse HTML bookmarks: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

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
