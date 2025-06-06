
/**
 * This file simulates browser extension APIs that would be available in a real extension
 */

import { Bookmark, createBookmark } from './bookmarkUtils';

// Use the same storage key as the main application
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
      
      // Check if bookmark with same URL already exists
      const existingBookmarkIndex = existingBookmarks.findIndex(
        b => b.url === message.bookmark?.url
      );
      
      let updatedBookmarks: Bookmark[];
      
      if (existingBookmarkIndex >= 0) {
        // Update existing bookmark
        const updatedBookmark = createBookmark(
          message.bookmark.url,
          message.bookmark.title,
          message.bookmark.tags,
          existingBookmarks
        );
        
        // Keep the same ID and order but update other properties
        updatedBookmark.id = existingBookmarks[existingBookmarkIndex].id;
        updatedBookmark.order = existingBookmarks[existingBookmarkIndex].order;
        
        // Handle createdAt date (may not exist in older bookmarks)
        if (existingBookmarks[existingBookmarkIndex].createdAt) {
          updatedBookmark.createdAt = existingBookmarks[existingBookmarkIndex].createdAt;
        }
        
        // Replace the existing bookmark
        existingBookmarks[existingBookmarkIndex] = updatedBookmark;
        updatedBookmarks = [...existingBookmarks];
        
        // Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBookmarks));
        
        // Return success with "updated" message
        return { 
          success: true, 
          message: 'Bookmark updated successfully',
          bookmarks: updatedBookmarks
        };
      } else {
        // Create a new bookmark
        const newBookmark = createBookmark(
          message.bookmark.url,
          message.bookmark.title,
          message.bookmark.tags,
          existingBookmarks
        );
        
        // Add it to storage
        updatedBookmarks = [...existingBookmarks, newBookmark];
        
        // Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBookmarks));
        
        // Return success with "added" message
        return { 
          success: true, 
          message: 'Bookmark added successfully',
          bookmarks: updatedBookmarks
        };
      }
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
  // Check URL parameters (used for bookmarklet)
  const urlParams = new URLSearchParams(window.location.search);
  const urlFromParams = urlParams.get('url');
  const titleFromParams = urlParams.get('title');
  
  if (urlFromParams) {
    return {
      url: urlFromParams,
      title: titleFromParams || 'Bookmarked Page'
    };
  }
  
  // Fall back to current page info
  return {
    url: window.location.href,
    title: document.title
  };
};
