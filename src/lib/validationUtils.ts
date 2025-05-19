
import { validateAndSanitizeUrl } from './urlUtils';

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
