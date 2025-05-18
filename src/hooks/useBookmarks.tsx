
import { useState, useEffect, useCallback } from 'react';
import { Bookmark, createBookmark } from '@/lib/bookmarkUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useBookmarks() {
  // State for bookmarks from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize state
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Add a new bookmark
  const addBookmark = useCallback((title: string, url: string, thumbnail?: string, tags: string[] = [], folderId?: string) => {
    // Validate tags
    const validatedTags = tags.filter(tag => {
      // Only keep tags that are valid
      return tag.trim().length > 0 && tag.trim().length <= 15 && !tag.includes('.');
    });
    
    // Filter out duplicates
    const uniqueTags = [...new Set(validatedTags)];
    
    const newBookmark = createBookmark(title, url, thumbnail, uniqueTags, folderId, bookmarks);
    setBookmarks([...bookmarks, newBookmark]);
    return newBookmark;
  }, [bookmarks, setBookmarks]);
  
  // Update a bookmark
  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    // Validate tags if present
    if (updates.tags) {
      updates.tags = [...new Set(updates.tags.filter(tag => {
        return tag.trim().length > 0 && tag.trim().length <= 15 && !tag.includes('.');
      }))];
    }
    
    setBookmarks(prevBookmarks => 
      prevBookmarks.map(bookmark => 
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
  }, [setBookmarks]);
  
  // Delete a bookmark
  const deleteBookmark = useCallback((id: string) => {
    setBookmarks(prevBookmarks => 
      prevBookmarks.filter(bookmark => bookmark.id !== id)
    );
  }, [setBookmarks]);
  
  // Reorder bookmarks
  const reorderBookmarks = useCallback((reorderedBookmarks: Bookmark[]) => {
    const updatedBookmarks = reorderedBookmarks.map((bookmark, index) => ({
      ...bookmark,
      order: index,
    }));
    
    setBookmarks(updatedBookmarks);
  }, [setBookmarks]);
  
  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    reorderBookmarks
  };
}
