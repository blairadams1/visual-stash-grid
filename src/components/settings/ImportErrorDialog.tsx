
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
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDetails: string;
  errorTitle?: string;
}

const ImportErrorDialog: React.FC<ImportErrorDialogProps> = ({ 
  open, 
  onOpenChange, 
  errorDetails, 
  errorTitle = "Import Error"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {errorTitle}
          </DialogTitle>
          <DialogDescription>
            The following errors were detected during import:
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] mt-4 border rounded-md p-4 bg-muted/30">
          <pre className="text-xs whitespace-pre-wrap">{errorDetails}</pre>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportErrorDialog;
