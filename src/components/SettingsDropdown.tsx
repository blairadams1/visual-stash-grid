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
import { Bookmark as BookmarkType, createBookmark, Folder, createFolder } from '@/lib/bookmarkUtils';
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
import { useToast } from '@/components/ui/use-toast';

interface SettingsDropdownProps {
  bookmarks: BookmarkType[];
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
  currentTheme: 'light' | 'dark';
  currentCardSize: 'small' | 'medium' | 'large';
  onToggleSidebar: () => void;
  onImportBookmarks?: (bookmarks: BookmarkType[], folders?: Folder[]) => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  bookmarks,
  onChangeTheme,
  onChangeCardSize,
  currentTheme,
  currentCardSize,
  onToggleSidebar,
  onImportBookmarks,
}) => {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const { toast } = useToast();
  
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
  
  // Generate thumbnail based on URL
  const generateThumbnail = (url: string): string => {
    // Try to extract domain for favicon
    try {
      const domain = new URL(url).hostname;
      // Return a fallback image or try to get favicon
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      // Return a placeholder image if URL is invalid
      return `https://via.placeholder.com/300x200/f0f0f0/808080?text=${encodeURIComponent(url)}`;
    }
  };
  
  // Generate automatic tags based on URL and title
  const generateAutomaticTags = (url: string, title: string): string[] => {
    const tags = new Set<string>();
    
    // Extract domain as a tag
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const domainParts = domain.split('.');
      if (domainParts.length > 0) {
        tags.add(domainParts[0]); // Add the main domain name as a tag
      }
    } catch (e) {
      // Skip if URL is invalid
    }
    
    // Extract key words from title
    if (title) {
      // Split the title into words
      const words = title.toLowerCase().split(/\s+/);
      
      // Common words to filter out
      const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
      
      // Add meaningful words from title as tags (if they're at least 4 characters)
      words.forEach(word => {
        // Clean the word of special characters
        const cleanWord = word.replace(/[^\w\s]/gi, '');
        if (cleanWord.length >= 4 && !commonWords.has(cleanWord)) {
          tags.add(cleanWord);
        }
      });
    }
    
    // Add category tags based on URL patterns
    if (url.includes('github.com')) tags.add('developer');
    if (url.includes('youtube.com') || url.includes('vimeo.com')) tags.add('video');
    if (url.includes('docs.google.com')) tags.add('document');
    if (url.includes('medium.com') || url.includes('blog')) tags.add('blog');
    
    // Limit to 3-4 tags and convert Set back to array
    return Array.from(tags).slice(0, 4);
  };
  
  // Parse HTML bookmarks file
  const parseHTMLBookmarks = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');
    
    const importedBookmarks: BookmarkType[] = [];
    const importedFolders: Folder[] = [];
    const folderMap: Record<string, Folder> = {};
    let currentOrder = bookmarks.length;
    
    // Process folder structure first
    const processFolder = (element: Element, parentFolderId?: string) => {
      // Get all direct DT children that contain folders (DL)
      const folderItems = element.querySelectorAll(':scope > dt');
      
      folderItems.forEach(folderItem => {
        const h3 = folderItem.querySelector('h3');
        const dl = folderItem.querySelector('dl');
        
        if (h3 && dl) {
          // This is a folder
          const folderName = h3.textContent || 'Imported Folder';
          const newFolder = createFolder(folderName, undefined, [], importedFolders, parentFolderId);
          
          importedFolders.push(newFolder);
          folderMap[dl.id || `folder_${importedFolders.length}`] = newFolder;
          
          // Process links within this folder
          processFolder(dl, newFolder.id);
        } else {
          // This might be a direct bookmark
          const link = folderItem.querySelector('a');
          if (link) {
            const url = link.getAttribute('href') || '';
            const title = link.textContent || url;
            const add_date = link.getAttribute('add_date') || '';
            const tagsAttr = link.getAttribute('tags') || '';
            
            // Get tags from the TAGS attribute if available
            let initialTags: string[] = [];
            if (tagsAttr) {
              initialTags = tagsAttr.split(',').map(tag => tag.trim());
            }
            
            // Generate automatic tags if we don't have enough
            if (initialTags.length < 3) {
              const generatedTags = generateAutomaticTags(url, title);
              // Combine and ensure uniqueness
              const allTags = [...new Set([...initialTags, ...generatedTags])];
              initialTags = allTags.slice(0, 4); // Limit to 4 tags
            }
            
            const thumbnail = generateThumbnail(url);
            const newBookmark = createBookmark(
              title, 
              url, 
              thumbnail, 
              initialTags, 
              parentFolderId
            );
            
            importedBookmarks.push(newBookmark);
          }
        }
      });
    };
    
    // Start processing from the main DL element
    const mainDL = doc.querySelector('dl');
    if (mainDL) {
      processFolder(mainDL);
    } else {
      // Fallback to just grabbing all links if structure doesn't match expected format
      links.forEach((link, index) => {
        const url = link.getAttribute('href') || '';
        const title = link.textContent || url;
        const tags = generateAutomaticTags(url, title);
        const thumbnail = generateThumbnail(url);
        
        const newBookmark = createBookmark(
          title, 
          url, 
          thumbnail, 
          tags
        );
        
        importedBookmarks.push(newBookmark);
      });
    }
    
    return { bookmarks: importedBookmarks, folders: importedFolders };
  };
  
  // Process imported JSON bookmarks
  const processJSONBookmarks = (jsonData: any) => {
    if (!Array.isArray(jsonData)) {
      toast({
        title: "Import Error",
        description: "Invalid JSON format. Expected an array of bookmarks.",
        variant: "destructive",
      });
      return { bookmarks: [], folders: [] };
    }
    
    const importedBookmarks: BookmarkType[] = [];
    let currentOrder = bookmarks.length;
    
    jsonData.forEach((item, index) => {
      if (typeof item === 'object' && item !== null && item.url) {
        // Basic validation
        const url = item.url?.toString() || '';
        const title = item.title?.toString() || url;
        
        // Use existing tags or generate new ones
        let tags = Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : [];
        if (tags.length < 3) {
          // Add generated tags if we don't have enough
          const generatedTags = generateAutomaticTags(url, title);
          // Combine and ensure uniqueness
          const allTags = [...new Set([...tags, ...generatedTags])];
          tags = allTags.slice(0, 4); // Limit to 4 tags
        }
        
        // Use existing thumbnail or generate one
        const thumbnail = item.thumbnail || generateThumbnail(url);
        
        // Create the bookmark
        const newBookmark = createBookmark(
          title, 
          url, 
          thumbnail, 
          tags, 
          item.folderId
        );
        
        importedBookmarks.push(newBookmark);
      }
    });
    
    return { bookmarks: importedBookmarks, folders: [] }; // No folder support in this basic JSON format
  };
  
  // Function to handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, format: 'json' | 'html') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let importResults = { bookmarks: [] as BookmarkType[], folders: [] as Folder[] };
        
        if (format === 'json') {
          // Parse JSON and validate
          const importedData = JSON.parse(content);
          importResults = processJSONBookmarks(importedData);
        } else if (format === 'html') {
          // Parse HTML bookmarks
          importResults = parseHTMLBookmarks(content);
        }
        
        if (importResults.bookmarks.length > 0) {
          if (onImportBookmarks) {
            onImportBookmarks(importResults.bookmarks, importResults.folders);
            toast({
              title: "Import Successful",
              description: `Imported ${importResults.bookmarks.length} bookmarks and ${importResults.folders.length} folders.`,
            });
          }
        } else {
          toast({
            title: "Import Error",
            description: "No valid bookmarks found in the file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: `Error importing file: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
      
      // Reset the file input
      event.target.value = '';
    };
    
    reader.readAsText(file);
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
