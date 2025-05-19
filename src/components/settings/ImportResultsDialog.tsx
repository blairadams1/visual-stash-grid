
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ImportStats {
  bookmarks: {
    total: number;
    imported: number;
    failed: number;
    errors?: string[];
  };
  folders: {
    total: number;
    imported: number;
    failed: number;
    errors?: string[];
  };
  warningCount: number;
  warnings?: string[];
  elapsedTime?: number;
}

interface ImportResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: ImportStats;
  onNavigateToFolder?: (folderId: string | null) => void;
}

const ImportResultsDialog: React.FC<ImportResultsDialogProps> = ({ 
  open, 
  onOpenChange, 
  stats,
  onNavigateToFolder
}) => {
  // Calculate success percentage
  const totalItems = stats.bookmarks.total + stats.folders.total;
  const totalImported = stats.bookmarks.imported + stats.folders.imported;
  const successRate = totalItems > 0 ? Math.round((totalImported / totalItems) * 100) : 0;
  
  // Determine if there were any errors
  const hasErrors = stats.bookmarks.failed > 0 || stats.folders.failed > 0;
  const hasWarnings = stats.warningCount > 0;
  
  // Determine dialog status and color
  const getStatusColor = () => {
    if (hasErrors) return "text-destructive";
    if (hasWarnings) return "text-yellow-500";
    return "text-green-500";
  };
  
  const getStatusText = () => {
    if (hasErrors && stats.bookmarks.imported === 0 && stats.folders.imported === 0) 
      return "Import Failed";
    if (hasErrors) return "Partial Success";
    if (hasWarnings) return "Success with Warnings";
    return "Import Successful";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
            {hasErrors ? <Info className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            {getStatusText()}
          </DialogTitle>
          <DialogDescription>
            Import completed with {successRate}% success rate
            {stats.elapsedTime && <> in {(stats.elapsedTime / 1000).toFixed(1)}s</>}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-3 bg-muted/30 rounded-md">
              <h3 className="text-sm font-medium">Bookmarks</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Imported:</span>
                <Badge variant={stats.bookmarks.failed > 0 ? "outline" : "default"} className="ml-2">
                  {stats.bookmarks.imported}/{stats.bookmarks.total}
                </Badge>
              </div>
              {stats.bookmarks.failed > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-destructive">Failed:</span>
                  <Badge variant="destructive" className="ml-2">{stats.bookmarks.failed}</Badge>
                </div>
              )}
            </div>
            
            <div className="space-y-2 p-3 bg-muted/30 rounded-md">
              <h3 className="text-sm font-medium">Folders</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Imported:</span>
                <Badge variant={stats.folders.failed > 0 ? "outline" : "default"} className="ml-2">
                  {stats.folders.imported}/{stats.folders.total}
                </Badge>
              </div>
              {stats.folders.failed > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-destructive">Failed:</span>
                  <Badge variant="destructive" className="ml-2">{stats.folders.failed}</Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Show errors and warnings if any */}
          {(hasErrors || hasWarnings) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Issues</h3>
                <ScrollArea className="max-h-[200px] rounded-md border p-2">
                  {(stats.bookmarks.errors || []).length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-destructive">Bookmark Errors:</h4>
                      <ul className="text-xs pl-4 list-disc space-y-1">
                        {stats.bookmarks.errors?.map((error, i) => (
                          <li key={`be-${i}`} className="text-destructive">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(stats.folders.errors || []).length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-destructive">Folder Errors:</h4>
                      <ul className="text-xs pl-4 list-disc space-y-1">
                        {stats.folders.errors?.map((error, i) => (
                          <li key={`fe-${i}`} className="text-destructive">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(stats.warnings || []).length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-yellow-500">Warnings:</h4>
                      <ul className="text-xs pl-4 list-disc space-y-1">
                        {stats.warnings?.map((warning, i) => (
                          <li key={`w-${i}`} className="text-yellow-500">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
          
          {/* Navigation options */}
          {stats.bookmarks.imported > 0 && onNavigateToFolder && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">View Imported Items</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      onNavigateToFolder(null);
                      onOpenChange(false);
                    }}
                  >
                    View All Bookmarks
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportResultsDialog;
