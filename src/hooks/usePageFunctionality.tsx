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
    
    // Initialize folderIdMap to track folder ID mappings
    const folderIdMap = new Map<string, string>();
    
    // Process folders first to maintain hierarchy
    if (importedFolders.length > 0) {
      console.log(`Importing ${importedFolders.length} folders...`);
      
      // Create a map to track folder dependencies and their status
      const folderDependencies = new Map<string, Set<string>>();
      const processedFolderIds = new Set<string>();
      const circularDependencies = new Set<string>();
      
      // First pass: build dependency graph
      importedFolders.forEach(folder => {
        if (folder.parentId) {
          if (!folderDependencies.has(folder.id)) {
            folderDependencies.set(folder.id, new Set());
          }
          folderDependencies.get(folder.id)?.add(folder.parentId);
        }
      });
      
      // Function to detect circular dependencies using DFS
      const detectCircularDependencies = (folderId: string, visited: Set<string>, path: Set<string>) => {
        if (path.has(folderId)) {
          // Found a circular dependency
          path.forEach(id => circularDependencies.add(id));
          return true;
        }
        
        if (visited.has(folderId)) {
          return false;
        }
        
        visited.add(folderId);
        path.add(folderId);
        
        const dependencies = folderDependencies.get(folderId);
        if (dependencies) {
          for (const depId of dependencies) {
            if (detectCircularDependencies(depId, visited, path)) {
              return true;
            }
          }
        }
        
        path.delete(folderId);
        return false;
      };
      
      // Detect all circular dependencies
      importedFolders.forEach(folder => {
        if (!processedFolderIds.has(folder.id)) {
          detectCircularDependencies(folder.id, new Set(), new Set());
        }
      });
      
      // Function to get folder depth (distance from root)
      const getFolderDepth = (folderId: string, depth: number = 0, visited: Set<string> = new Set()): number => {
        if (visited.has(folderId)) {
          return depth;
        }
        visited.add(folderId);
        
        const dependencies = folderDependencies.get(folderId);
        if (!dependencies || dependencies.size === 0) {
          return depth;
        }
        
        let maxDepth = depth;
        for (const depId of dependencies) {
          if (!circularDependencies.has(depId)) {
            maxDepth = Math.max(maxDepth, getFolderDepth(depId, depth + 1, visited));
          }
        }
        return maxDepth;
      };
      
      // Sort folders by depth (shallowest first) and handle circular dependencies
      const sortedFolders = [...importedFolders].sort((a, b) => {
        const depthA = getFolderDepth(a.id);
        const depthB = getFolderDepth(b.id);
        return depthA - depthB;
      });
      
      // Process folders in order
      sortedFolders.forEach(folder => {
        let parentId: string | undefined;
        
        if (folder.parentId && !circularDependencies.has(folder.id)) {
          // If parent exists and this folder isn't part of a circular dependency
          const mappedParentId = folderIdMap.get(folder.parentId);
          if (mappedParentId) {
            parentId = mappedParentId;
          }
        }
        
        // Create the folder
        const newFolder = addFolder(
          folder.name,
          folder.image,
          folder.tags,
          parentId
        );
        
        folderIdMap.set(folder.id, newFolder.id);
        processedFolderIds.add(folder.id);
        importedFolderCount++;
        
        console.log(`Created folder "${folder.name}" with ID: ${newFolder.id}${parentId ? ` under parent: ${parentId}` : ''}`);
      });
      
      // Log any circular dependencies that were found
      if (circularDependencies.size > 0) {
        console.warn('Found circular dependencies in folders:', Array.from(circularDependencies));
        toast({
          title: "Folder Structure Warning",
          description: "Some folders had circular references and were imported without parent relationships.",
          variant: "warning", // Now "warning" is a valid variant
        });
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
