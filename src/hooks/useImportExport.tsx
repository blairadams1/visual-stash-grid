
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';

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

  // Handle importing bookmarks and folders
  const handleImportBookmarks = useCallback((importedBookmarks: Bookmark[], importedFolders: Folder[] = []) => {
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
  }, [addBookmark, addFolder, refreshBookmarks, setCurrentFolderId, setJustImported, setSelectedTags, toast]);

  return {
    refreshBookmarks,
    handleImportBookmarks
  };
};
