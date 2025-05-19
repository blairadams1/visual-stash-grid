
import { useCallback } from 'react';
import { Bookmark } from '@/lib/bookmarkUtils';

/**
 * Hook for bookmark-related operations
 */
export const useBookmarkHandlers = (
  addBookmark: (title: string, url: string, thumbnail?: string, tags?: string[], folderId?: string) => Bookmark,
  currentFolderId: string | null
) => {
  // Handle adding a new bookmark
  const handleAddBookmark = useCallback((bookmark: Bookmark) => {
    // Add current folder ID if we're inside a folder
    if (currentFolderId) {
      bookmark.folderId = currentFolderId;
    }
    
    const newBookmark = addBookmark(
      bookmark.title,
      bookmark.url,
      bookmark.thumbnail,
      bookmark.tags,
      bookmark.folderId
    );
    
    console.log(`Added bookmark "${bookmark.title}" with ID: ${newBookmark.id}`);
    
    // Dispatch custom event to trigger grid refresh
    window.dispatchEvent(new CustomEvent('bookmarkChange', { 
      detail: { timestamp: Date.now() } 
    }));
    
    return newBookmark;
  }, [addBookmark, currentFolderId]);

  // Get current site information for quick bookmarking
  const getCurrentPageInfo = useCallback(() => {
    if (typeof window !== 'undefined') {
      return {
        title: document.title || "TagMarked",
        url: window.location.href || "https://tagmarked.app"
      };
    }
    return {
      title: "TagMarked",
      url: "https://tagmarked.app"
    };
  }, []);

  return {
    handleAddBookmark,
    getCurrentPageInfo
  };
};
