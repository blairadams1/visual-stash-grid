
import { useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFolders } from '@/hooks/useFolders';
import { usePageState } from '@/hooks/usePageState';
import { useTagHandlers } from '@/hooks/useTagHandlers';
import { useFolderHandlers } from '@/hooks/useFolderHandlers';
import { useBookmarkHandlers } from '@/hooks/useBookmarkHandlers';
import { useImportExport } from '@/hooks/useImportExport';

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
  
  // Get state management
  const pageState = usePageState();
  const {
    selectedTags,
    setSelectedTags,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    setCurrentFolder,
    justImported,
    setJustImported,
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
  
  // Get import/export handlers
  const importExportHandlers = useImportExport(
    addBookmark,
    addFolder,
    setSelectedTags,
    setCurrentFolderId,
    setJustImported
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

  // Listen for force refresh events
  useEffect(() => {
    const handleForceRefresh = (e: Event) => {
      console.log('Received force bookmark refresh event', e);
      importExportHandlers.refreshBookmarks();
      
      // Set a flag that we just imported - this will reset after 5 seconds
      setJustImported(true);
      setTimeout(() => setJustImported(false), 5000);
    };
    
    window.addEventListener('forceBookmarkRefresh', handleForceRefresh);
    return () => {
      window.removeEventListener('forceBookmarkRefresh', handleForceRefresh);
    };
  }, [importExportHandlers, setJustImported]);

  // Apply theme when it changes
  useEffect(() => {
    if (pageState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [pageState.theme]);

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
    ...importExportHandlers,
    
    // Direct actions from hooks
    deleteBookmark,
    updateBookmark,
    deleteFolder,
    updateFolder,
    reorderBookmarks,
    
    // Additional functions
    toggleSidebar,
  };
};
