
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
  
  // Get the import stats and dialog functionality
  const { 
    importStats, 
    showResultsDialog, 
    setShowResultsDialog 
  } = useImportExport;
  
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
      {importStats && (
        <ImportResultsDialog
          open={showResultsDialog}
          onOpenChange={setShowResultsDialog}
          stats={importStats}
          onNavigateToFolder={handleNavigateToFolder}
        />
      )}
    </>
  );
};

export default SettingsDropdown;
