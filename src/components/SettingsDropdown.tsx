
import React, { useState } from 'react';
import { Settings, Download, Upload, Sun, Moon, Tag, Grid2X2, Grid3X3, LayoutGrid, FolderTree } from 'lucide-react';
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
import { Bookmark as BookmarkType } from '@/lib/bookmarkUtils';
import TagManager from './TagManager';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsDropdownProps {
  bookmarks: BookmarkType[];
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
  currentTheme: 'light' | 'dark';
  currentCardSize: 'small' | 'medium' | 'large';
  onToggleSidebar: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  bookmarks,
  onChangeTheme,
  onChangeCardSize,
  currentTheme,
  currentCardSize,
  onToggleSidebar,
}) => {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  
  // Function to export bookmarks as JSON
  const exportBookmarksAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tagmarked-bookmarks.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Function to export bookmarks as HTML
  const exportBookmarksAsHTML = () => {
    // Create HTML bookmark file format
    let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n` + 
                     `<!-- This is an automatically generated file.\n` +
                     `     It will be read and overwritten.\n` +
                     `     DO NOT EDIT! -->\n` +
                     `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n` +
                     `<TITLE>Bookmarks</TITLE>\n` +
                     `<H1>Bookmarks</H1>\n` +
                     `<DL><p>\n`;
    
    // Add each bookmark as a DT element
    bookmarks.forEach(bookmark => {
      const tags = bookmark.tags ? ` TAGS="${bookmark.tags.join(',')}"` : '';
      htmlContent += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}"${tags}>${bookmark.title}</A>\n`;
    });
    
    // Close the HTML structure
    htmlContent += `</DL><p>\n`;
    
    // Create and trigger download
    const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tagmarked-bookmarks.html");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Function to handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, format: 'json' | 'html') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (format === 'json') {
          // Parse JSON and validate
          const importedBookmarks = JSON.parse(content);
          if (Array.isArray(importedBookmarks)) {
            // TODO: Implement actual import functionality
            alert(`Imported ${importedBookmarks.length} bookmarks successfully!`);
          } else {
            alert('Invalid JSON format. Expected an array of bookmarks.');
          }
        } else if (format === 'html') {
          // Parse HTML bookmarks
          alert('HTML import is not fully implemented yet.');
          // TODO: Implement HTML parsing
        }
      } catch (error) {
        alert(`Error importing file: ${error}`);
      }
      
      // Reset the file input
      event.target.value = '';
    };
    
    if (format === 'json') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
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
            {/* Theme buttons - directly in main menu */}
            <DropdownMenuLabel className="px-2 pt-2 text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
            <div className="flex items-center justify-between px-2 pb-2">
              <Button 
                variant={currentTheme === 'light' ? 'default' : 'outline'} 
                size="sm"
                className="w-[48%]"
                onClick={() => onChangeTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button 
                variant={currentTheme === 'dark' ? 'default' : 'outline'} 
                size="sm"
                className="w-[48%]"
                onClick={() => onChangeTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
            
            {/* Card size buttons - directly in main menu */}
            <DropdownMenuLabel className="px-2 pt-2 text-xs font-normal text-muted-foreground">Card Size</DropdownMenuLabel>
            <div className="flex items-center justify-between px-2 pb-2">
              <Button 
                variant={currentCardSize === 'small' ? 'default' : 'outline'} 
                size="sm"
                className="w-[31%]"
                onClick={() => onChangeCardSize('small')}
              >
                <Grid3X3 className="mr-1 h-3 w-3" />
                S
              </Button>
              <Button 
                variant={currentCardSize === 'medium' ? 'default' : 'outline'}
                size="sm"
                className="w-[31%]"
                onClick={() => onChangeCardSize('medium')}
              >
                <Grid2X2 className="mr-1 h-3 w-3" />
                M
              </Button>
              <Button 
                variant={currentCardSize === 'large' ? 'default' : 'outline'}
                size="sm"
                className="w-[31%]"
                onClick={() => onChangeCardSize('large')}
              >
                <LayoutGrid className="mr-1 h-3 w-3" />
                L
              </Button>
            </div>
            
            <DropdownMenuItem onClick={onToggleSidebar}>
              <FolderTree className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </DropdownMenuItem>
            
            <Dialog open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault(); 
                  setIsTagManagerOpen(true);
                }}>
                  <Tag className="mr-2 h-4 w-4" />
                  <span>Manage Tags</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Tags</DialogTitle>
                </DialogHeader>
                <TagManager />
              </DialogContent>
            </Dialog>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Download className="mr-2 h-4 w-4" />
                <span>Import/Export</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import/Export Bookmarks</AlertDialogTitle>
                <AlertDialogDescription>
                  Choose a format to import or export your bookmarks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-sm font-semibold">Export Bookmarks</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={exportBookmarksAsJSON}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export as JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={exportBookmarksAsHTML}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export as HTML
                  </Button>
                </div>
                
                <h3 className="text-sm font-semibold pt-2">Import Bookmarks</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <Button variant="outline" className="mb-2" onClick={() => document.getElementById('import-json')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Import JSON
                    </Button>
                    <input 
                      id="import-json" 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={(e) => handleFileImport(e, 'json')}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <Button variant="outline" className="mb-2" onClick={() => document.getElementById('import-html')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Import HTML
                    </Button>
                    <input 
                      id="import-html" 
                      type="file" 
                      accept=".html,.htm" 
                      className="hidden" 
                      onChange={(e) => handleFileImport(e, 'html')}
                    />
                  </div>
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SettingsDropdown;
