
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Folder } from '@/lib/types';
import { processFolders } from '@/lib/folderImportUtils';
import { ImportStats } from '@/components/settings/ImportResultsDialog';

/**
 * Hook for import/export functionality with improved error handling and statistics
 */
export const useImportExport = (
  addBookmark: (title: string, url: string, thumbnail?: string, tags?: string[], folderId?: string) => Bookmark,
  addFolder: (name: string, image?: string, tags?: string[], parentId?: string) => Folder,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>>,
  setJustImported: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

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

  // Handle importing bookmarks and folders with enhanced logging and error handling
  const handleImportBookmarks = useCallback((importedBookmarks: Bookmark[], importedFolders: Folder[] = []) => {
    console.log(`Starting import of ${importedBookmarks.length} bookmarks and ${importedFolders.length} folders`);
    
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const bookmarkErrors: string[] = [];
    const folderErrors: string[] = [];
    
    // Initialize stats object
    const stats: ImportStats = {
      bookmarks: {
        total: importedBookmarks.length,
        imported: 0,
        failed: 0,
        errors: []
      },
      folders: {
        total: importedFolders.length,
        imported: 0,
        failed: 0,
        errors: []
      },
      warningCount: 0,
      warnings: [],
      elapsedTime: 0
    };
    
    // Log the first few items for debugging
    if (importedBookmarks.length > 0) {
      console.log('First imported bookmark:', importedBookmarks[0]);
    }
    if (importedFolders.length > 0) {
      console.log('First imported folder:', importedFolders[0]);
    }
    
    // Clear any selected filters/tags to ensure imported items are visible
    setSelectedTags([]);
    setCurrentFolderId(null);
    
    // Skip processing if both arrays are empty
    if (importedBookmarks.length === 0 && importedFolders.length === 0) {
      console.warn('No bookmarks or folders to import');
      const errorMsg = "No valid bookmarks or folders found to import.";
      errors.push(errorMsg);
      toast({
        title: "Import Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      stats.bookmarks.errors = bookmarkErrors;
      stats.folders.errors = folderErrors;
      stats.warnings = warnings;
      stats.warningCount = warnings.length;
      stats.elapsedTime = Date.now() - startTime;
      
      setImportStats(stats);
      setShowResultsDialog(true);
      
      // Throw to signal error to parent components
      throw new Error(errorMsg);
    }
    
    try {
      // Process the folders first to maintain hierarchy
      const { folderIdMap, importedFolderCount, errors: processFolderErrors } = processFolders(importedFolders, addFolder);
      
      // Update folder stats
      stats.folders.imported = importedFolderCount;
      stats.folders.failed = importedFolders.length - importedFolderCount;
      
      if (processFolderErrors.length > 0) {
        folderErrors.push(...processFolderErrors);
      }
      
      // Check for circular dependencies
      if (importedFolderCount < importedFolders.length) {
        const warningMsg = `Some folders were not imported due to circular dependencies. Imported: ${importedFolderCount}/${importedFolders.length}`;
        console.warn(warningMsg);
        warnings.push(warningMsg);
        toast({
          title: "Folder Structure Warning",
          description: "Some folders had circular references and were imported without parent relationships.",
          variant: "warning",
        });
      }
      
      // Track how many bookmarks we've successfully imported
      let importedBookmarkCount = 0;
      
      // Now import bookmarks and map folder IDs
      console.log('Processing bookmarks with mapped folder IDs');
      importedBookmarks.forEach((bookmark, index) => {
        try {
          // Map the folder ID if it exists
          const mappedFolderId = bookmark.folderId && folderIdMap.has(bookmark.folderId) 
            ? folderIdMap.get(bookmark.folderId) 
            : undefined;
          
          if (mappedFolderId) {
            console.log(`Mapping bookmark "${bookmark.title}" from folder ID ${bookmark.folderId} to ${mappedFolderId}`);
          }
            
          // Create the bookmark with the mapped folder ID
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
        } catch (error) {
          const errorMsg = `Error importing bookmark "${bookmark.title}": ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          bookmarkErrors.push(errorMsg);
        }
      });
      
      // Update bookmark stats
      stats.bookmarks.imported = importedBookmarkCount;
      stats.bookmarks.failed = importedBookmarks.length - importedBookmarkCount;
      
      // Add bookmark errors to the main errors array
      if (bookmarkErrors.length > 0) {
        errors.push(`Failed to import ${bookmarkErrors.length} bookmarks.`);
        if (bookmarkErrors.length < 5) {
          errors.push(...bookmarkErrors);
        } else {
          errors.push(...bookmarkErrors.slice(0, 5));
          errors.push(`...and ${bookmarkErrors.length - 5} more bookmark import errors.`);
        }
      }
      
      // Finalize stats
      stats.bookmarks.errors = bookmarkErrors;
      stats.folders.errors = folderErrors;
      stats.warnings = warnings;
      stats.warningCount = warnings.length;
      stats.elapsedTime = Date.now() - startTime;
      
      console.log(`Import completed. Added ${importedBookmarkCount} bookmarks and ${importedFolderCount} folders.`);
      
      // Set a flag that we just imported - increase the timeout to 15 seconds
      setJustImported(true);
      setTimeout(() => setJustImported(false), 15000);
      
      // Save the import stats and show the results dialog
      setImportStats(stats);
      setShowResultsDialog(true);
      
      // Refresh to ensure everything is displayed
      refreshBookmarks();
      
      // Show success toast with count details and any warnings
      if (errors.length > 0 && (importedBookmarkCount > 0 || importedFolderCount > 0)) {
        toast({
          title: "Import completed with warnings",
          description: `Added ${importedBookmarkCount} bookmarks and ${importedFolderCount} folders, but encountered some issues.`,
          variant: "warning",
        });
        
        // Throw to signal partial success but with errors
        throw new Error(`Import completed with ${errors.length} issues:\n${errors.join('\n')}`);
      } else if (errors.length === 0) {
        toast({
          title: "Import completed",
          description: `Added ${importedBookmarkCount} bookmarks and ${importedFolderCount} folders.`,
        });
      }
      
      // If no items were imported, show a warning
      if (importedBookmarkCount === 0 && importedFolderCount === 0) {
        const errorMsg = "No bookmarks or folders could be imported. Check file format.";
        errors.push(errorMsg);
        toast({
          title: "Import Warning",
          description: errorMsg,
          variant: "destructive",
        });
        
        // Throw to signal error to parent components
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Pass the error up to be displayed in the dialog
      console.error('Import process error:', error);
      
      // Check if this is our own error with details, otherwise add it to errors
      if (!(error instanceof Error && errors.length > 0)) {
        errors.push(`Import process error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Update stats with any errors
      if (!stats.bookmarks.errors?.length) {
        stats.bookmarks.errors = bookmarkErrors;
      }
      if (!stats.folders.errors?.length) {
        stats.folders.errors = folderErrors;
      }
      if (!stats.warnings?.length) {
        stats.warnings = warnings;
      }
      stats.warningCount = (stats.warnings || []).length;
      stats.elapsedTime = Date.now() - startTime;
      
      setImportStats(stats);
      setShowResultsDialog(true);
      
      throw new Error(errors.join('\n'));
    }
  }, [addBookmark, addFolder, refreshBookmarks, setCurrentFolderId, setJustImported, setSelectedTags, toast]);

  return {
    refreshBookmarks,
    handleImportBookmarks,
    importStats,
    showResultsDialog,
    setShowResultsDialog
  };
};
