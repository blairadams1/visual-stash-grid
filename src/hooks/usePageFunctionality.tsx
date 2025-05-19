
import { useState, useEffect } from 'react';
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

  // Force refresh bookmarks from local storage
  const refreshBookmarks = () => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      // This will trigger a re-render through the useBookmarks hook
      localStorage.setItem("bookmarks", storedBookmarks);
    }
    
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
      // This will trigger a re-render through the useFolders hook
      localStorage.setItem("folders", storedFolders);
    }
    
    toast({
      title: "Content refreshed",
    });
  };

  // Handle adding a new bookmark
  const handleAddBookmark = (bookmark: Bookmark) => {
    // Add current folder ID if we're inside a folder
    if (currentFolderId) {
      bookmark.folderId = currentFolderId;
    }
    addBookmark(
      bookmark.title,
      bookmark.url,
      bookmark.thumbnail,
      bookmark.tags,
      bookmark.folderId
    );
    
    // Dispatch custom event to trigger grid refresh
    window.dispatchEvent(new Event('bookmarkChange'));
  };

  // Handle adding a new folder
  const handleAddFolder = (folderData: Partial<Folder>) => {
    addFolder(
      folderData.name || "New Folder", 
      folderData.image,
      folderData.tags
    );
    toast({
      title: "Folder created",
    });
    setShowFolderForm(false);
  };

  // Handle importing bookmarks and folders
  const handleImportBookmarks = (importedBookmarks: Bookmark[], importedFolders: Folder[] = []) => {
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
          const newFolder = addFolder(
            folder.name, 
            folder.image, 
            folder.tags
          );
          
          folderIdMap.set(folder.id, newFolder.id);
          processedFolderIds.add(folder.id);
        });
      
      // Second pass: add folders with parent dependencies
      let remainingFolders = importedFolders.filter(folder => !processedFolderIds.has(folder.id));
      while (remainingFolders.length > 0) {
        const initialLength = remainingFolders.length;
        
        for (let i = 0; i < remainingFolders.length; i++) {
          const folder = remainingFolders[i];
          
          // If this folder has a parent that's been processed
          if (!folder.parentId || processedFolderIds.has(folder.parentId)) {
            // Map parent ID if it exists
            const parentId = folder.parentId ? folderIdMap.get(folder.parentId) : undefined;
            
            const newFolder = addFolder(
              folder.name, 
              folder.image, 
              folder.tags,
              parentId
            );
            
            folderIdMap.set(folder.id, newFolder.id);
            processedFolderIds.add(folder.id);
          }
        }
        
        // Remove processed folders
        remainingFolders = remainingFolders.filter(folder => !processedFolderIds.has(folder.id));
        
        // If we haven't made progress, break to avoid infinite loop
        if (remainingFolders.length === initialLength) {
          console.warn('Circular dependency detected in folder structure. Skipping remaining folders.');
          break;
        }
      }
      
      // Now import bookmarks and map folder IDs
      importedBookmarks.forEach(bookmark => {
        // Map the folder ID if it exists
        const mappedFolderId = bookmark.folderId && folderIdMap.has(bookmark.folderId) 
          ? folderIdMap.get(bookmark.folderId) 
          : undefined;
          
        addBookmark(
          bookmark.title,
          bookmark.url,
          bookmark.thumbnail,
          bookmark.tags,
          mappedFolderId
        );
      });
    } else {
      // No folders, just import bookmarks
      importedBookmarks.forEach(bookmark => {
        addBookmark(
          bookmark.title,
          bookmark.url,
          bookmark.thumbnail,
          bookmark.tags,
          bookmark.folderId
        );
      });
    }
    
    // Refresh to ensure everything is displayed
    refreshBookmarks();
    
    toast({
      title: "Import completed",
      description: `Added ${importedBookmarks.length} bookmarks and ${importedFolders.length} folders.`,
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
