import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFolders } from '@/hooks/useFolders';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';

export const usePageFunctionality = () => {
  // Use custom hooks
  const { bookmarks, addBookmark, deleteBookmark, updateBookmark, reorderBookmarks } = useBookmarks();
  const { folders, addFolder, deleteFolder, updateFolder, reorderFolders } = useFolders();
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  // State to track if we just imported bookmarks
  const [justImported, setJustImported] = useState(false);
  
  // Presentation settings
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [cardSize, setCardSize] = useLocalStorage<'small' | 'medium' | 'large'>('cardSize', 'medium');
  
  const { toast } = useToast();
  
  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update current folder when ID changes
  useEffect(() => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      setCurrentFolder(folder || null);
    } else {
      setCurrentFolder(null);
    }
  }, [currentFolderId, folders]);

  // Listen for force refresh events
  useEffect(() => {
    const handleForceRefresh = (e: Event) => {
      console.log('Received force bookmark refresh event', e);
      refreshBookmarks();
      
      // Set a flag that we just imported - this will reset after 5 seconds
      setJustImported(true);
      setTimeout(() => setJustImported(false), 5000);
    };
    
    window.addEventListener('forceBookmarkRefresh', handleForceRefresh);
    return () => {
      window.removeEventListener('forceBookmarkRefresh', handleForceRefresh);
    };
  }, []);

  // Force refresh bookmarks from local storage
  const refreshBookmarks = useCallback(() => {
    console.log('Refreshing bookmarks and folders from local storage');
    
    // For bookmarks
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      try {
        // Parse to validate, then re-save with timestamp to force refresh
        const parsedBookmarks = JSON.parse(storedBookmarks);
        localStorage.setItem("bookmarks", JSON.stringify(parsedBookmarks));
        
        // Also trigger a manual event for components to react to
        window.dispatchEvent(new CustomEvent('bookmarkChange', { 
          detail: { timestamp: Date.now() } 
        }));
        
        console.log(`Refreshed ${parsedBookmarks.length} bookmarks`);
      } catch (e) {
        console.error('Error parsing stored bookmarks', e);
      }
    }
    
    // For folders
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
      try {
        // Parse to validate, then re-save with timestamp to force refresh
        const parsedFolders = JSON.parse(storedFolders);
        localStorage.setItem("folders", JSON.stringify(parsedFolders));
        
        console.log(`Refreshed ${parsedFolders.length} folders`);
      } catch (e) {
        console.error('Error parsing stored folders', e);
      }
    }
    
    toast({
      title: "Content refreshed",
    });
  }, [toast]);

  // Handle adding a new bookmark
  const handleAddBookmark = (bookmark: Bookmark) => {
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
  };

  // Handle adding a new folder
  const handleAddFolder = (folderData: Partial<Folder>) => {
    const newFolder = addFolder(
      folderData.name || "New Folder", 
      folderData.image,
      folderData.tags
    );
    
    console.log(`Added folder "${folderData.name}" with ID: ${newFolder.id}`);
    
    toast({
      title: "Folder created",
    });
    setShowFolderForm(false);
  };

  // Handle importing bookmarks and folders with improved logging and debug
  const handleImportBookmarks = (importedBookmarks: Bookmark[], importedFolders: Folder[] = []) => {
    console.log(`Starting import of ${importedBookmarks.length} bookmarks and ${importedFolders.length} folders`);
    
    // Clear any selected filters/tags to ensure imported items are visible
    setSelectedTags([]);
    setCurrentFolderId(null);
    
    // Track how many items we've successfully imported
    let importedBookmarkCount = 0;
    let importedFolderCount = 0;
    
    // Process folders first to maintain hierarchy
    if (importedFolders.length > 0) {
      console.log(`Importing ${importedFolders.length} folders...`);
      
      // Process folders in order (parents first)
      const processedFolderIds = new Set<string>();
      const folderIdMap = new Map<string, string>(); // Map old folder IDs to new ones
      
      // First pass: add folders without parent dependencies
      importedFolders
        .filter(folder => !folder.parentId || !importedFolders.some(f => f.id === folder.parentId))
        .forEach(folder => {
          console.log(`Adding root folder "${folder.name}" with ID: ${folder.id}`);
          
          const newFolder = addFolder(
            folder.name, 
            folder.image, 
            folder.tags
          );
          
          folderIdMap.set(folder.id, newFolder.id);
          processedFolderIds.add(folder.id);
          importedFolderCount++;
          
          console.log(`Mapped imported folder ID ${folder.id} to new folder ID ${newFolder.id}`);
        });
      
      // Second pass: add folders with parent dependencies
      let remainingFolders = importedFolders.filter(folder => !processedFolderIds.has(folder.id));
      let iteration = 0;
      const maxIterations = 10; // Prevent infinite loops
      
      while (remainingFolders.length > 0 && iteration < maxIterations) {
        iteration++;
        console.log(`Processing remaining folders: ${remainingFolders.length} (iteration ${iteration})`);
        
        const initialLength = remainingFolders.length;
        const processedThisRound = new Set<string>();
        
        for (let i = 0; i < remainingFolders.length; i++) {
          const folder = remainingFolders[i];
          
          // If this folder has a parent that's been processed
          if (!folder.parentId || processedFolderIds.has(folder.parentId)) {
            // Map parent ID if it exists
            const parentId = folder.parentId ? folderIdMap.get(folder.parentId) : undefined;
            
            console.log(`Adding child folder "${folder.name}" with parent: ${parentId || 'none'}`);
            
            const newFolder = addFolder(
              folder.name, 
              folder.image, 
              folder.tags,
              parentId
            );
            
            folderIdMap.set(folder.id, newFolder.id);
            processedFolderIds.add(folder.id);
            processedThisRound.add(folder.id);
            importedFolderCount++;
            
            console.log(`Mapped imported folder ID ${folder.id} to new folder ID ${newFolder.id}`);
          }
        }
        
        // Remove processed folders
        remainingFolders = remainingFolders.filter(folder => !processedThisRound.has(folder.id));
        
        // If we haven't made progress, break to avoid infinite loop
        if (remainingFolders.length === initialLength) {
          console.warn('Circular dependency detected in folder structure. Processing remaining folders without parents.');
          
          // Process remaining folders without trying to maintain parent relationships
          remainingFolders.forEach(folder => {
            console.log(`Adding orphaned folder "${folder.name}" without parent`);
            const newFolder = addFolder(folder.name, folder.image, folder.tags);
            folderIdMap.set(folder.id, newFolder.id);
            importedFolderCount++;
          });
          
          break;
        }
      }
      
      // Now import bookmarks and map folder IDs
      console.log('Processing bookmarks with mapped folder IDs');
      importedBookmarks.forEach((bookmark, index) => {
        // Map the folder ID if it exists
        const mappedFolderId = bookmark.folderId && folderIdMap.has(bookmark.folderId) 
          ? folderIdMap.get(bookmark.folderId) 
          : undefined;
        
        if (mappedFolderId) {
          console.log(`Mapping bookmark "${bookmark.title}" from folder ID ${bookmark.folderId} to ${mappedFolderId}`);
        }
          
        const newBookmark = addBookmark(
          bookmark.title,
          bookmark.url,
          bookmark.thumbnail,
          bookmark.tags,
          mappedFolderId
        );
        
        if (index < 5 || index % 50 === 0) {
          console.log(`Added bookmark ${index+1}/${importedBookmarks.length}: "${bookmark.title}" with ID ${newBookmark.id}`);
        }
        
        importedBookmarkCount++;
      });
    } else {
      // No folders, just import bookmarks
      console.log('Importing bookmarks without folders');
      importedBookmarks.forEach((bookmark, index) => {
        const newBookmark = addBookmark(
          bookmark.title,
          bookmark.url,
          bookmark.thumbnail,
          bookmark.tags,
          bookmark.folderId
        );
        
        if (index < 5 || index % 50 === 0) {
          console.log(`Added bookmark ${index+1}/${importedBookmarks.length}: "${bookmark.title}" with ID ${newBookmark.id}`);
        }
        
        importedBookmarkCount++;
      });
    }
    
    console.log(`Import completed. Added ${importedBookmarkCount} bookmarks and ${importedFolderCount} folders.`);
    
    // Set a flag that we just imported
    setJustImported(true);
    setTimeout(() => setJustImported(false), 5000);
    
    // Refresh to ensure everything is displayed
    refreshBookmarks();
    
    toast({
      title: "Import completed",
      description: `Added ${importedBookmarkCount} bookmarks and ${importedFolderCount} folders.`,
    });
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => {
      // Only add if not already there
      if (!prev.includes(tag)) {
        return [...prev, tag];
      }
      return prev;
    });
    // Close the filter sheet after tag selection for better UX
    setIsFilterOpen(false);
  };

  // Handle tag deselection
  const handleTagDeselect = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Handle clearing all tags
  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // Handle opening a folder
  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  // Handle moving a bookmark to a folder
  const handleMoveToFolder = (bookmarkId: string, folderId: string) => {
    updateBookmark(bookmarkId, { folderId });
    toast({
      title: "Bookmark moved to folder",
    });
  };

  // Get current site information for quick bookmarking
  const getCurrentPageInfo = () => {
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
  };
  
  // Toggle collections sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return {
    bookmarks,
    folders,
    searchQuery,
    setSearchQuery,
    selectedTags,
    showForm,
    setShowForm,
    showFolderForm,
    setShowFolderForm,
    isFilterOpen,
    setIsFilterOpen,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    showSidebar,
    setShowSidebar,
    selectedCollectionId,
    setSelectedCollectionId,
    theme,
    setTheme,
    cardSize,
    setCardSize,
    justImported,
    refreshBookmarks,
    handleAddBookmark,
    handleAddFolder,
    handleImportBookmarks,
    handleTagSelect,
    handleTagDeselect,
    handleClearAllTags,
    handleOpenFolder,
    handleMoveToFolder,
    getCurrentPageInfo,
    toggleSidebar,
    deleteBookmark,
    updateBookmark,
    deleteFolder,
    updateFolder,
    reorderBookmarks
  };
};
