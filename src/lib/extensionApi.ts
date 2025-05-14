
/**
 * This file simulates browser extension APIs that would be available in a real extension
 */

import { Bookmark, createBookmark } from './bookmarkUtils';

// Storage simulation for when running as a webpage instead of extension
const LOCAL_STORAGE_KEY = 'bookmarks';

export interface ExtensionMessage {
  type: 'ADD_BOOKMARK' | 'GET_BOOKMARKS';
  bookmark?: {
    url: string;
    title: string;
    tags: string[];
  };
}

export interface ExtensionResponse {
  success: boolean;
  message?: string;
  bookmarks?: Bookmark[];
}

/**
 * Simulates browser.runtime.sendMessage API for extensions
 */
export const sendMessage = async (message: ExtensionMessage): Promise<ExtensionResponse> => {
  // When running in browser (not as extension), use localStorage
  if (message.type === 'ADD_BOOKMARK' && message.bookmark) {
    try {
      // Get existing bookmarks
      const existingBookmarks: Bookmark[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
      );
      
      // Create a new bookmark
      const newBookmark = createBookmark(
        message.bookmark.url,
        message.bookmark.title,
        message.bookmark.tags,
        existingBookmarks
      );
      
      // Add it to storage
      const updatedBookmarks = [...existingBookmarks, newBookmark];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBookmarks));
      
      return { 
        success: true, 
        message: 'Bookmark added successfully',
        bookmarks: updatedBookmarks
      };
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return { 
        success: false, 
        message: 'Failed to add bookmark'
      };
    }
  }
  
  if (message.type === 'GET_BOOKMARKS') {
    try {
      const bookmarks: Bookmark[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
      );
      return { 
        success: true,
        bookmarks 
      };
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return { 
        success: false, 
        message: 'Failed to get bookmarks'
      };
    }
  }
  
  return { success: false, message: 'Unknown message type' };
};

/**
 * Simulates getting the current tab information in an extension
 */
export const getCurrentTab = async (): Promise<{ url: string; title: string } | null> => {
  // In a real extension, this would use browser APIs to get the current tab
  // For demo purposes, we'll just return the current page
  return {
    url: window.location.href,
    title: document.title
  };
};

