
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Tag } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Folder as FolderType } from "@/lib/bookmarkUtils";
import FolderForm from './FolderForm';
import { AspectRatio } from "./ui/aspect-ratio";

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
      className="overflow-hidden transition-shadow hover:shadow-lg relative h-full"
      onDoubleClick={handleDoubleClick}
    >
      <CardContent className="p-0 h-full flex flex-col relative">
        {/* Container for the folder image with consistent aspect ratio */}
        <div className="w-full h-full relative">
          <AspectRatio ratio={3/2}>
            <img
              src="/lovable-uploads/ee3d1214-9131-4ec4-9312-ddc55b3b8d6f.png"
              alt={folder.name}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          
          {/* Folder name at top - adjusted position */}
          <div className="absolute left-[6%] top-[6%] z-10">
            <span className="text-sm font-medium truncate text-amber-800 dark:text-amber-200">
              {folder.name}
            </span>
          </div>
          
          {/* Edit buttons positioned higher up - moved up more */}
          <div className="absolute bottom-[25%] right-[6%] z-10 flex space-x-3">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Edit className="h-4 w-4" />
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
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this folder?")) {
                  onDelete(folder.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Tags moved inside the aspect ratio container to avoid whitespace at bottom */}
      {folder.tags && folder.tags.length > 0 && (
        <div className="absolute bottom-[5%] left-[6%] right-[6%] z-10">
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-gray-500" />
            {folder.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FolderCard;
