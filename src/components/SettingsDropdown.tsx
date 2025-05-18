
import { useState } from 'react';
import { Settings, Download, Upload, BookmarkPlus, Palette, Layout, Moon, Sun, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookmarkletInstall from './BookmarkletInstall';
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SettingsDropdownProps {
  bookmarks: any[];
  onChangeLayout: (layout: 'grid' | 'list' | 'compact') => void;
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
  currentLayout: 'grid' | 'list' | 'compact';
  currentTheme: 'light' | 'dark';
  currentCardSize: 'small' | 'medium' | 'large';
}

const SettingsDropdown = ({ 
  bookmarks, 
  onChangeLayout, 
  onChangeTheme, 
  onChangeCardSize,
  currentLayout,
  currentTheme,
  currentCardSize 
}: SettingsDropdownProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importHtmlDialogOpen, setImportHtmlDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bookmarkletDialogOpen, setBookmarkletDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importHtmlFile, setImportHtmlFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Import/export functionality
  const handleExportBookmarks = () => {
    try {
      // Create a JSON string of the bookmarks data
      const bookmarksData = JSON.stringify(bookmarks, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([bookmarksData], { type: 'application/json' });
      
      // Create an object URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `tagmarked-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportDialogOpen(false);
      toast({
        title: "Export successful",
        description: "Your bookmarks have been exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your bookmarks",
        variant: "destructive",
      });
    }
  };

  const handleImportBookmarks = () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        
        // Validate the imported data format
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid import format");
        }
        
        // Store the imported bookmarks in localStorage
        localStorage.setItem("bookmarks", JSON.stringify(importedData));
        
        setImportDialogOpen(false);
        setImportFile(null);
        
        toast({
          title: "Import successful",
          description: `${importedData.length} bookmarks have been imported`,
        });
        
        // Refresh the page to show the imported bookmarks
        window.location.reload();
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import failed",
          description: "The selected file contains invalid data",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(importFile);
  };

  const handleImportHtmlBookmarks = () => {
    if (!importHtmlFile) {
      toast({
        title: "No file selected",
        description: "Please select an HTML bookmarks file to import",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const htmlContent = event.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Extract bookmarks from HTML
        const links = doc.querySelectorAll('a');
        const existingBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        
        let importCount = 0;
        const newBookmarks = [...existingBookmarks];
        const highestOrder = Math.max(...existingBookmarks.map((b: any) => b.order || 0), 0);
        
        links.forEach((link, index) => {
          const url = link.getAttribute('href');
          const title = link.textContent || url || 'Untitled Bookmark';
          const dateAdded = link.getAttribute('add_date');
          
          // Check if this is a valid bookmark URL
          if (url && (url.startsWith('http') || url.startsWith('https'))) {
            // Check if bookmark with same URL already exists
            const exists = newBookmarks.some((b: any) => b.url === url);
            if (!exists) {
              // Get tags from parent folders
              let tags: string[] = [];
              let parent = link.parentElement;
              while (parent && parent.tagName !== 'DL') {
                if (parent.tagName === 'H3') {
                  const folderName = parent.textContent;
                  if (folderName) tags.push(folderName.trim());
                }
                parent = parent.parentElement;
              }
              
              // Create new bookmark
              const newBookmark = {
                id: `bookmark-${Date.now()}-${index}`,
                title: title,
                url: url,
                thumbnail: `https://www.google.com/s2/favicons?domain=${url}&sz=128`,
                tags: tags,
                order: highestOrder + index + 1,
                dateAdded: dateAdded ? new Date(parseInt(dateAdded) * 1000).toISOString() : new Date().toISOString()
              };
              
              newBookmarks.push(newBookmark);
              importCount++;
            }
          }
        });
        
        // Save all bookmarks back to localStorage
        localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
        
        setImportHtmlDialogOpen(false);
        setImportHtmlFile(null);
        
        toast({
          title: "HTML Import successful",
          description: `${importCount} bookmarks have been imported`,
        });
        
        // Refresh the page to show the imported bookmarks
        window.location.reload();
        
      } catch (error) {
        console.error("HTML Import error:", error);
        toast({
          title: "HTML Import failed",
          description: "There was an error importing your HTML bookmarks",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(importHtmlFile);
  };

  // Export bookmarks as HTML
  const handleExportHtmlBookmarks = () => {
    try {
      let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;
      
      // Create a map of tags to bookmarks
      const tagMap = new Map<string, any[]>();
      
      // Add bookmarks with no tags to a default folder
      const noTagBookmarks = bookmarks.filter(b => !b.tags || b.tags.length === 0);
      if (noTagBookmarks.length > 0) {
        tagMap.set('Uncategorized', noTagBookmarks);
      }
      
      // Group bookmarks by their first tag
      bookmarks.forEach(bookmark => {
        if (bookmark.tags && bookmark.tags.length > 0) {
          const primaryTag = bookmark.tags[0];
          if (!tagMap.has(primaryTag)) {
            tagMap.set(primaryTag, []);
          }
          tagMap.get(primaryTag)?.push(bookmark);
        }
      });
      
      // Create folder structure and add bookmarks
      tagMap.forEach((tagBookmarks, tag) => {
        const timestamp = Math.floor(Date.now() / 1000);
        htmlContent += `    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${tag}</H3>
    <DL><p>
`;
        
        tagBookmarks.forEach(bookmark => {
          const addDate = bookmark.dateAdded 
            ? Math.floor(new Date(bookmark.dateAdded).getTime() / 1000)
            : Math.floor(Date.now() / 1000);
            
          htmlContent += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${addDate}">${bookmark.title}</A>
`;
        });
        
        htmlContent += `    </DL><p>
`;
      });
      
      htmlContent += `</DL><p>`;
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "HTML Export successful",
        description: "Your bookmarks have been exported as HTML",
      });
      
    } catch (error) {
      console.error("HTML Export error:", error);
      toast({
        title: "HTML Export failed", 
        description: "There was an error exporting your bookmarks as HTML",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Layout className="mr-2 h-4 w-4" />
              <span>Layout Options</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={currentLayout} onValueChange={(value) => onChangeLayout(value as 'grid' | 'list' | 'compact')}>
                <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={currentTheme} onValueChange={(value) => onChangeTheme(value as 'light' | 'dark')}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 h-4 w-4" />
              <span>Card Size</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={currentCardSize} onValueChange={(value) => onChangeCardSize(value as 'small' | 'medium' | 'large')}>
                <DropdownMenuRadioItem value="small">Small</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="large">Large</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import JSON Bookmarks
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setImportHtmlDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import HTML Bookmarks
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON Bookmarks
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportHtmlBookmarks}>
            <Download className="mr-2 h-4 w-4" />
            Export HTML Bookmarks
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setBookmarkletDialogOpen(true)}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Install Bookmarklet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Bookmarks</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing your bookmarks
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImportBookmarks}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import HTML Dialog */}
      <Dialog open={importHtmlDialogOpen} onOpenChange={setImportHtmlDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import HTML Bookmarks</DialogTitle>
            <DialogDescription>
              Upload an HTML bookmarks file exported from another browser
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => setImportHtmlFile(e.target.files?.[0] || null)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setImportHtmlDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImportHtmlBookmarks}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Bookmarks</DialogTitle>
            <DialogDescription>
              Download your bookmarks as a JSON file
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p>You are about to export {bookmarks.length} bookmarks.</p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExportBookmarks}
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bookmarklet Dialog */}
      <Dialog open={bookmarkletDialogOpen} onOpenChange={setBookmarkletDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install TagMarked</DialogTitle>
            <DialogDescription>
              Add TagMarked to your browser for quick bookmarking
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4">
            <h3 className="font-medium mb-2">Option 1: Drag to bookmarks bar</h3>
            <p className="text-sm text-gray-500 mb-3">
              Drag the button below to your bookmarks bar to install the bookmarklet.
            </p>
            <div className="flex justify-center mb-6">
              <a 
                href={`javascript:(function(){
                  const popup = window.open('${window.location.origin}/extension?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title),'TagMarked','width=400,height=500,resizable=yes');
                  if(!popup) alert('Please allow popups for TagMarked to work properly.');
                })();`}
                className="px-4 py-2 bg-bookmark-blue text-white rounded-md no-underline font-medium"
                onClick={(e) => e.preventDefault()}
                draggable="true"
              >
                📚 TagMarked
              </a>
            </div>
            
            <h3 className="font-medium mb-2">Option 2: Copy the link</h3>
            <p className="text-sm text-gray-500 mb-3">
              Copy this link and create a new bookmark manually.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`javascript:(function(){
                  const popup = window.open('${window.location.origin}/extension?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title),'TagMarked','width=400,height=500,resizable=yes');
                  if(!popup) alert('Please allow popups for TagMarked to work properly.');
                })();`}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(`javascript:(function(){
                    const popup = window.open('${window.location.origin}/extension?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title),'TagMarked','width=400,height=500,resizable=yes');
                    if(!popup) alert('Please allow popups for TagMarked to work properly.');
                  })();`);
                  
                  toast({
                    title: "Copied to clipboard",
                    description: "Bookmarklet code copied successfully",
                  });
                }}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBookmarkletDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsDropdown;
