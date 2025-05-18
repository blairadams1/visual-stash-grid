
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tag } from 'lucide-react';
import TagManager from '@/components/TagManager';

interface TagManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TagManagerDialog: React.FC<TagManagerDialogProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault(); 
          onOpenChange(true);
        }}>
          <Tag className="mr-2 h-4 w-4" />
          <span>Manage Tags</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-bookmark-blue text-white p-4 -mt-6 -mx-6 rounded-t-lg">Manage Tags</DialogTitle>
        </DialogHeader>
        <TagManager />
      </DialogContent>
    </Dialog>
  );
};

export default TagManagerDialog;
