
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Folder } from '@/lib/types';
import { parseHTMLBookmarks, processJSONBookmarks } from '@/lib/importExportUtils';
import { Loader2 } from 'lucide-react';
import ImportErrorDialog from './ImportErrorDialog';

interface ImportBookmarksProps {
  onImportBookmarks?: (bookmarks: Bookmark[], folders?: Folder[]) => void;
  isImporting?: boolean;
}

const ImportBookmarks: React.FC<ImportBookmarksProps> = ({ onImportBookmarks, isImporting = false }) => {
  const { toast } = useToast();
  const [processingFile, setProcessingFile] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Function to handle file import with better error handling and logs
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, format: 'json' | 'html') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessingFile(true);
    toast({
      title: "Processing Import",
      description: `Analyzing your ${format.toUpperCase()} bookmark file...`,
    });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let importResults = { bookmarks: [] as Bookmark[], folders: [] as Folder[], error: null as string | null };
        
        if (format === 'json') {
          console.log('Processing JSON import...');
          console.log('JSON content length:', content.length);
          
          // Parse JSON and validate
          try {
            const importedData = JSON.parse(content);
            importResults = processJSONBookmarks(importedData);
          } catch (error) {
            console.error('JSON parsing error:', error);
            const errorMsg = `Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`;
            setImportError(errorMsg);
            setIsErrorDialogOpen(true);
            toast({
              title: "Import Error",
              description: "Invalid JSON format. Please check your file.",
              variant: "destructive",
            });
            setProcessingFile(false);
            return;
          }
        } else if (format === 'html') {
          console.log('Processing HTML import...');
          console.log('HTML content length:', content.length);
          console.log('HTML content starts with:', content.substring(0, 100));
          
          // Parse HTML bookmarks
          importResults = parseHTMLBookmarks(content);
        }
        
        if (importResults.error) {
          console.error('Import error:', importResults.error);
          setImportError(importResults.error);
          setIsErrorDialogOpen(true);
          toast({
            title: "Import Error",
            description: "Error during import. See details for more information.",
            variant: "destructive",
          });
          setProcessingFile(false);
          return;
        }
        
        console.log(`Import parsed: ${importResults.bookmarks.length} bookmarks, ${importResults.folders.length} folders`);
        
        // Show warning if nothing was imported
        if (importResults.bookmarks.length === 0 && importResults.folders.length === 0) {
          setImportError("No valid bookmarks or folders were found in the file. Verify that the file contains valid bookmarks in the expected format.");
          setIsErrorDialogOpen(true);
          toast({
            title: "Import Error",
            description: "No valid bookmarks found in the file.",
            variant: "destructive",
          });
          setProcessingFile(false);
          return;
        }
        
        if (importResults.bookmarks.length > 0 || importResults.folders.length > 0) {
          if (onImportBookmarks) {
            // Pass both bookmarks and folders for processing
            onImportBookmarks(importResults.bookmarks, importResults.folders);
          }
        }
      } catch (error) {
        console.error("Import error:", error);
        setImportError(`Error importing file: ${error instanceof Error ? error.message : String(error)}`);
        setIsErrorDialogOpen(true);
        toast({
          title: "Import Error",
          description: "Error importing file. See details for more information.",
          variant: "destructive",
        });
      }
      
      // Reset the file input and state
      event.target.value = '';
      setProcessingFile(false);
    };
    
    reader.onerror = () => {
      console.error("FileReader error");
      setImportError("Failed to read the file. The file may be corrupted or too large.");
      setIsErrorDialogOpen(true);
      toast({
        title: "Import Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
      setProcessingFile(false);
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
            disabled={isImporting || processingFile}
          >
            {processingFile || isImporting ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <Upload className="mr-2 h-4 w-4" />
            }
            {processingFile ? "Processing..." : isImporting ? "Importing..." : "Import JSON"}
          </Button>
          <input 
            id="import-json" 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'json')}
            disabled={isImporting || processingFile}
          />
        </div>
        
        <div className="flex flex-col">
          <Button 
            variant="outline" 
            className="mb-2" 
            onClick={() => document.getElementById('import-html')?.click()}
            disabled={isImporting || processingFile}
          >
            {processingFile || isImporting ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <Upload className="mr-2 h-4 w-4" />
            }
            {processingFile ? "Processing..." : isImporting ? "Importing..." : "Import HTML"}
          </Button>
          <input 
            id="import-html" 
            type="file" 
            accept=".html,.htm" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'html')}
            disabled={isImporting || processingFile}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Supports HTML exports from Chrome, Firefox, and Safari browsers, or JSON exports from Tagmarked.
      </p>
      
      {/* Error Dialog */}
      <ImportErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        errorDetails={importError || ""}
      />
    </div>
  );
};

export default ImportBookmarks;
