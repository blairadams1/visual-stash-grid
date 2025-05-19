
import { validateAndSanitizeUrl } from './urlUtils';

// Enhanced function to validate HTML structure with improved format detection
export const validateHtmlStructure = (html: string): boolean => {
  // Make case-insensitive checks for required elements
  const lowerHtml = html.toLowerCase();
  
  // Check for basic bookmark structure elements (case-insensitive)
  const requiredElements = ['<dl', '<dt', '<a'];
  const basicStructureValid = requiredElements.every(element => 
    lowerHtml.includes(element.toLowerCase())
  );
  
  if (!basicStructureValid) {
    console.warn('HTML validation failed: Missing basic bookmark structure elements');
    return false;
  }
  
  // Check for common bookmark header patterns
  const hasNetscapeHeader = html.includes('DOCTYPE NETSCAPE-Bookmark-file-1') || 
                          html.includes('NETSCAPE-Bookmark-file-1');
                          
  const hasBookmarksHeader = lowerHtml.includes('<title>bookmarks</title>') || 
                           lowerHtml.includes('<h1>bookmarks</h1>') ||
                           lowerHtml.includes('<h3>bookmarks</h3>');
  
  // Log what we found for debugging
  console.log('HTML validation details:', {
    basicStructureValid,
    hasNetscapeHeader,
    hasBookmarksHeader,
    htmlLength: html.length,
    firstFewChars: html.substring(0, 100),
  });
  
  // Accept files that have either proper headers or at least the basic structure
  return basicStructureValid && (hasNetscapeHeader || hasBookmarksHeader || html.includes('<DL>'));
};

// Helper function to validate bookmark data
export const validateBookmarkData = (data: any): { isValid: boolean; errors: string[] } => {
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
export const validateFolderData = (data: any): { isValid: boolean; errors: string[] } => {
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
