
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Folder } from '@/lib/types';

/**
 * Hook for folder-related operations
 */
export const useFolderHandlers = (
  folders: Folder[],
  addFolder: (name: string, image?: string, tags?: string[], parentId?: string) => Folder,
  updateBookmark: (id: string, updates: any) => void,
  setCurrentFolderId: React.Dispatch<React.SetStateAction<string | null>>,
  setShowFolderForm: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  // Handle adding a new folder
  const handleAddFolder = useCallback((folderData: Partial<Folder>) => {
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
    
    return newFolder;
  }, [addFolder, setShowFolderForm, toast]);

  // Handle opening a folder
  const handleOpenFolder = useCallback((folderId: string) => {
    setCurrentFolderId(folderId);
  }, [setCurrentFolderId]);

  // Handle moving a bookmark to a folder
  const handleMoveToFolder = useCallback((bookmarkId: string, folderId: string) => {
    updateBookmark(bookmarkId, { folderId });
    toast({
      title: "Bookmark moved to folder",
    });
  }, [updateBookmark, toast]);

  return {
    handleAddFolder,
    handleOpenFolder,
    handleMoveToFolder
  };
};
