
import React from 'react';
import { Settings, Download, Upload, Sun, Moon, Tag, Monitor, Grid2X2, Grid3X3, LayoutGrid, Bookmark, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  const [isTagManagerOpen, setIsTagManagerOpen] = React.useState(false);
  
  // Function to export bookmarks as JSON
  const exportBookmarks = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tagmarked-bookmarks.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
            <DropdownMenuItem onClick={onToggleSidebar}>
              <FolderTree className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onChangeTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {currentTheme === 'light' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {currentTheme === 'dark' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
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
          
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Card Size</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onChangeCardSize('small')}>
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    <span>Small</span>
                    {currentCardSize === 'small' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeCardSize('medium')}>
                    <Grid2X2 className="mr-2 h-4 w-4" />
                    <span>Medium</span>
                    {currentCardSize === 'medium' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeCardSize('large')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Large</span>
                    {currentCardSize === 'large' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={exportBookmarks}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Bookmarks</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SettingsDropdown;
