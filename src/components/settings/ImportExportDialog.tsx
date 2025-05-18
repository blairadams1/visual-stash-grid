
import React from 'react';
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

interface ImportExportDialogProps {
  bookmarks: Bookmark[];
  onImportBookmarks?: (bookmarks: Bookmark[], folders?: Folder[]) => void;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({ 
  bookmarks, 
  onImportBookmarks 
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
          <ExportBookmarks bookmarks={bookmarks} />
          <ImportBookmarks onImportBookmarks={onImportBookmarks} />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImportExportDialog;
