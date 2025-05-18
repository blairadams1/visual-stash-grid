
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, Trash2, Edit, Tag } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Folder as FolderType } from "@/lib/bookmarkUtils";
import FolderForm from './FolderForm';

interface FolderCardProps {
  folder: FolderType;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FolderType>) => void;
  onDoubleClick: (folderId: string) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onTagClick,
  onDelete,
  onUpdate,
  onDoubleClick,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDoubleClick = () => {
    onDoubleClick(folder.id);
  };

  return (
    <Card 
      className="h-full overflow-hidden transition-shadow hover:shadow-lg border-2 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800"
      onDoubleClick={handleDoubleClick}
    >
      <CardHeader className="p-2 flex-row items-center justify-between">
        <div className="flex items-center space-x-1">
          <Folder className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium truncate">{folder.name}</span>
        </div>
        <div className="flex space-x-1">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Folder</DialogTitle>
              </DialogHeader>
              <FolderForm 
                initialFolder={folder} 
                onSubmit={(updatedFolder) => {
                  onUpdate(folder.id, updatedFolder);
                  setIsEditDialogOpen(false);
                }}
                submitLabel="Update"
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={() => {
              if (confirm("Are you sure you want to delete this folder?")) {
                onDelete(folder.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="aspect-video overflow-hidden rounded-md border bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          <img
            src={folder.image}
            alt={folder.name}
            className="h-full w-full object-cover"
          />
        </div>
      </CardContent>
      {folder.tags && folder.tags.length > 0 && (
        <CardFooter className="p-2 pt-0 flex flex-wrap gap-1">
          <div className="flex items-center gap-1 w-full">
            <Tag className="h-3 w-3 text-gray-500" />
            {folder.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default FolderCard;
