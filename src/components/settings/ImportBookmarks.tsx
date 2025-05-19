
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';
import { parseHTMLBookmarks, processJSONBookmarks } from '@/lib/importExportUtils';

interface ImportBookmarksProps {
  onImportBookmarks?: (bookmarks: Bookmark[], folders?: Folder[]) => void;
  isImporting?: boolean;
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImportBookmarks, isImporting = false }) => {
  const { toast } = useToast();

  // Function to handle file import with better error handling and logs
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, format: 'json' | 'html') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    toast({
      title: "Processing Import",
      description: "Analyzing your bookmark file...",
    });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let importResults = { bookmarks: [] as Bookmark[], folders: [] as Folder[], error: null as string | null };
        
        if (format === 'json') {
          console.log('Processing JSON import...');
          // Parse JSON and validate
          const importedData = JSON.parse(content);
          importResults = processJSONBookmarks(importedData);
        } else if (format === 'html') {
          console.log('Processing HTML import...');
          console.log('HTML content length:', content.length);
          // Parse HTML bookmarks
          importResults = parseHTMLBookmarks(content);
        }
        
        if (importResults.error) {
          toast({
            title: "Import Error",
            description: importResults.error,
            variant: "destructive",
          });
          return;
        }
        
        console.log(`Import parsed: ${importResults.bookmarks.length} bookmarks, ${importResults.folders.length} folders`);
        console.log('First few bookmarks:', importResults.bookmarks.slice(0, 3));
        console.log('First few folders:', importResults.folders.slice(0, 3));
        
        if (importResults.bookmarks.length > 0 || importResults.folders.length > 0) {
          if (onImportBookmarks) {
            // Pass both bookmarks and folders for processing
            onImportBookmarks(importResults.bookmarks, importResults.folders);
          }
        } else {
          toast({
            title: "Import Error",
            description: "No valid bookmarks found in the file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
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
    <div className="space-y-2">
      <h3 className="text-sm font-semibold pt-2">Import Bookmarks</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <Button 
            variant="outline" 
            className="mb-2" 
            onClick={() => document.getElementById('import-json')?.click()}
            disabled={isImporting}
          >
            <Upload className="mr-2 h-4 w-4" /> 
            {isImporting ? "Importing..." : "Import JSON"}
          </Button>
          <input 
            id="import-json" 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'json')}
            disabled={isImporting}
          />
        </div>
        
        <div className="flex flex-col">
          <Button 
            variant="outline" 
            className="mb-2" 
            onClick={() => document.getElementById('import-html')?.click()}
            disabled={isImporting}
          >
            <Upload className="mr-2 h-4 w-4" /> 
            {isImporting ? "Importing..." : "Import HTML"}
          </Button>
          <input 
            id="import-html" 
            type="file" 
            accept=".html,.htm" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'html')}
            disabled={isImporting}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportBookmarks;
