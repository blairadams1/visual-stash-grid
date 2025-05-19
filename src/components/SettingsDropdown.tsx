
import React, { useState } from 'react';
import { Settings, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';
import ThemeSelector from './settings/ThemeSelector';
import CardSizeSelector from './settings/CardSizeSelector';
import ImportExportDialog from './settings/ImportExportDialog';
import TagManagerDialog from './settings/TagManagerDialog';
import BookmarkletInstall from './BookmarkletInstall';
import { useImportExport } from '@/hooks/useImportExport';
import ImportResultsDialog from './settings/ImportResultsDialog';

interface SettingsDropdownProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
  currentTheme: 'light' | 'dark';
  currentCardSize: 'small' | 'medium' | 'large';
  onToggleSidebar: () => void;
  onImportBookmarks?: (bookmarks: Bookmark[], folders?: Folder[]) => void;
  setCurrentFolderId?: React.Dispatch<React.SetStateAction<string | null>>;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  bookmarks,
  folders,
  onChangeTheme,
  onChangeCardSize,
  currentTheme,
  currentCardSize,
  onToggleSidebar,
  onImportBookmarks,
  setCurrentFolderId
}) => {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  
  // Pass dummy functions with the correct type signatures
  const dummyAddBookmark = (title: string, url: string, thumbnail?: string, tags: string[] = [], folderId?: string): Bookmark => {
    return {
      id: '',
      title,
      url,
      thumbnail: thumbnail || '',
      tags: tags || [],
      order: 0,
      dateAdded: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  };
  
  const dummyAddFolder = (name: string, image?: string, tags?: string[], parentId?: string): Folder => {
    return {
      id: '',
      name,
      image: image || '',
      tags: tags || [],
      order: 0,
      dateAdded: new Date().toISOString()
    };
  };
  
  const dummySetSelectedTags = () => {};
  const dummySetCurrentFolderId = () => {};
  const dummySetJustImported = () => {};
  
  const importExportUtils = useImportExport(
    dummyAddBookmark,
    dummyAddFolder,
    dummySetSelectedTags,
    dummySetCurrentFolderId,
    dummySetJustImported
  );
  
  // Function to navigate to a folder
  const handleNavigateToFolder = (folderId: string | null) => {
    if (setCurrentFolderId) {
      setCurrentFolderId(folderId);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {/* Theme selector */}
            <ThemeSelector 
              currentTheme={currentTheme} 
              onChangeTheme={onChangeTheme} 
            />
            
            {/* Card size selector */}
            <CardSizeSelector 
              currentCardSize={currentCardSize} 
              onChangeCardSize={onChangeCardSize} 
            />
            
            {/* Collections sidebar toggle */}
            <DropdownMenuItem onClick={onToggleSidebar}>
              <FolderTree className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </DropdownMenuItem>
            
            {/* Tag manager dialog */}
            <TagManagerDialog 
              isOpen={isTagManagerOpen} 
              onOpenChange={setIsTagManagerOpen} 
            />

            {/* Bookmarklet install dialog */}
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <BookmarkletInstall />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Import/Export dialog */}
          <ImportExportDialog 
            bookmarks={bookmarks}
            folders={folders}
            onImportBookmarks={onImportBookmarks}
            onNavigateToFolder={handleNavigateToFolder} 
          />
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Import results dialog */}
      {importExportUtils && importExportUtils.importStats && (
        <ImportResultsDialog
          open={importExportUtils.showResultsDialog}
          onOpenChange={importExportUtils.setShowResultsDialog}
          stats={importExportUtils.importStats}
          onNavigateToFolder={handleNavigateToFolder}
        />
      )}
    </>
  );
};

export default SettingsDropdown;
