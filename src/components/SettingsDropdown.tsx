
import { useState } from 'react';
import { Settings, Download, Upload, BookmarkPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import BookmarkletInstall from '@/components/BookmarkletInstall';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

interface SettingsDropdownProps {
  bookmarks: any[];
}

const SettingsDropdown = ({ bookmarks }: SettingsDropdownProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Bookmarks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export Bookmarks
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <div className="w-full cursor-pointer">
              <BookmarkPlus className="mr-2 h-4 w-4 inline-block" />
              <span className="inline-block">Install Bookmarklet</span>
            </div>
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
    </>
  );
};

export default SettingsDropdown;
