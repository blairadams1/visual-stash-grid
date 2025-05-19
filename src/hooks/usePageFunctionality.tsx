
import { useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFolders } from '@/hooks/useFolders';
import { usePageState } from '@/hooks/usePageState';
import { useTagHandlers } from '@/hooks/useTagHandlers';
import { useFolderHandlers } from '@/hooks/useFolderHandlers';
import { useBookmarkHandlers } from '@/hooks/useBookmarkHandlers';
import { useToast } from '@/hooks/use-toast';

/**
 * Main hook that combines all page functionality
 */
export const usePageFunctionality = () => {
  // Use custom hooks
  const { 
    bookmarks, 
    addBookmark, 
    deleteBookmark, 
    updateBookmark, 
    reorderBookmarks 
  } = useBookmarks();
  
  const { 
    folders, 
    addFolder, 
    deleteFolder, 
    updateFolder, 
    reorderFolders 
  } = useFolders();
  
  const { toast } = useToast();
  
  // Get state management
  const pageState = usePageState();
  const {
    selectedTags,
    setSelectedTags,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    setCurrentFolder,
    isFilterOpen,
    setIsFilterOpen,
    showSidebar,
  } = pageState;
  
  // Get tag handlers
  const tagHandlers = useTagHandlers(
    selectedTags,
    setSelectedTags,
    setIsFilterOpen
  );
  
  // Get folder handlers
  const folderHandlers = useFolderHandlers(
    folders,
    addFolder,
    updateBookmark,
    setCurrentFolderId,
    pageState.setShowFolderForm
  );
  
  // Get bookmark handlers
  const bookmarkHandlers = useBookmarkHandlers(
    addBookmark,
    currentFolderId
  );
  
  // Update current folder when ID changes
  useEffect(() => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      setCurrentFolder(folder || null);
    } else {
      setCurrentFolder(null);
    }
  }, [currentFolderId, folders, setCurrentFolder]);

  // Apply theme when it changes
  useEffect(() => {
    if (pageState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [pageState.theme]);

  // Simple refresh bookmarks function
  const refreshBookmarks = () => {
    window.dispatchEvent(new CustomEvent('bookmarkChange', { 
      detail: { timestamp: Date.now() } 
    }));
    
    window.dispatchEvent(new CustomEvent('folderChange', { 
      detail: { timestamp: Date.now() } 
    }));
    
    toast({
      title: "Content refreshed",
    });
  };

  // Toggle collections sidebar
  const toggleSidebar = () => {
    pageState.setShowSidebar(!showSidebar);
  };

  return {
    // Core data
    bookmarks,
    folders,
    
    // State from pageState
    ...pageState,
    
    // Handlers from other hooks
    ...tagHandlers,
    ...folderHandlers,
    ...bookmarkHandlers,
    
    // Direct actions from hooks
    deleteBookmark,
    updateBookmark,
    deleteFolder,
    updateFolder,
    reorderBookmarks,
    
    // Additional functions
    toggleSidebar,
    refreshBookmarks,
  };
};
