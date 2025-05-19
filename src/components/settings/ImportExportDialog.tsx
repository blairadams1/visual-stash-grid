import React, { useState } from 'react';
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
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';
import ExportBookmarks from './ExportBookmarks';
import ImportBookmarks from './ImportBookmarks';
import { useToast } from "@/components/ui/use-toast";

interface ImportExportDialogProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  onImportBookmarks?: (bookmarks: Bookmark[], folders?: Folder[]) => void;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({ 
  bookmarks,
  folders,
  onImportBookmarks 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Custom handler for import to provide feedback and close dialog when done
  const handleImport = (bookmarks: Bookmark[], folders?: Folder[]) => {
    if (onImportBookmarks) {
      setIsImporting(true);
      
      // Log the import details
      console.log(`Importing ${bookmarks.length} bookmarks and ${folders?.length || 0} folders`);
      
      // Perform the import
      onImportBookmarks(bookmarks, folders);
      
      toast({
        title: "Import successful",
        description: `Imported ${bookmarks.length} bookmarks and ${folders?.length || 0} folders. Refreshing display...`,
      });
      
      // Trigger a manual window event to force refresh
      window.dispatchEvent(new CustomEvent('forceBookmarkRefresh', { 
        detail: { timestamp: Date.now() } 
      }));
      
      // Close dialog after successful import (with slight delay)
      setTimeout(() => {
        setIsImporting(false);
        setIsOpen(false);
      }, 1500);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}>
          <Download className="mr-2 h-4 w-4" />
          <span>Import/Export</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="bg-bookmark-blue text-white p-4 -mt-6 -mx-6 rounded-t-lg">
            Import/Export Bookmarks
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-4">
            Choose a format to import or export your bookmarks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-1 gap-4">
          <ExportBookmarks bookmarks={bookmarks} folders={folders} />
          <ImportBookmarks 
            onImportBookmarks={handleImport} 
            isImporting={isImporting} 
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogAction disabled={isImporting}>
            {isImporting ? "Importing..." : "Close"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImportExportDialog;
