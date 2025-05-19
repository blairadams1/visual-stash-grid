import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Bookmark, Folder } from '@/lib/types';
import { processFolders } from '@/lib/folderImportUtils';

/**
 * Hook for import/export functionality
 */
export const useImportExport = (
  addBookmark: (title: string, url: string, thumbnail?: string, tags?: string[], folderId?: string) => Bookmark,
  addFolder: (name: string, image?: string, tags?: string[], parentId?: string) => Folder,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>>,
  setJustImported: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  // Force refresh bookmarks from local storage
  const refreshBookmarks = useCallback(() => {
    console.log('Refreshing bookmarks and folders from local storage');
    
    // Trigger manual events for components to react to
    window.dispatchEvent(new CustomEvent('bookmarkChange', { 
      detail: { timestamp: Date.now() } 
    }));
    
    window.dispatchEvent(new CustomEvent('folderChange', { 
      detail: { timestamp: Date.now() } 
    }));
    
    toast({
      title: "Content refreshed",
    });
  }, [toast]);

  // Handle importing bookmarks and folders
  const handleImportBookmarks = useCallback((importedBookmarks: Bookmark[], importedFolders: Folder[] = []) => {
    console.log(`Starting import of ${importedBookmarks.length} bookmarks and ${importedFolders.length} folders`);
    
    // Clear any selected filters/tags to ensure imported items are visible
    setSelectedTags([]);
    setCurrentFolderId(null);
    
    // Process the folders first to maintain hierarchy
    const { folderIdMap, importedFolderCount } = processFolders(importedFolders, addFolder);
    
    // Check for circular dependencies
    if (importedFolderCount < importedFolders.length) {
      console.warn(`Some folders were not imported due to circular dependencies. Imported: ${importedFolderCount}/${importedFolders.length}`);
      toast({
        title: "Folder Structure Warning",
        description: "Some folders had circular references and were imported without parent relationships.",
        variant: "destructive",
      });
    }
    
    // Track how many bookmarks we've successfully imported
    let importedBookmarkCount = 0;
    
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
  }, [addBookmark, addFolder, refreshBookmarks, setCurrentFolderId, setJustImported, setSelectedTags, toast]);

  return {
    refreshBookmarks,
    handleImportBookmarks
  };
};
