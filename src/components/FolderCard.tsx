
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
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FolderCardProps {
  folder: FolderType;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FolderType>) => void;
  onDoubleClick: (folderId: string) => void;
  isSelected?: boolean; // New prop for multi-select
  onSelect?: (id: string, isMultiSelect: boolean) => void; // New prop for selection
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onTagClick,
  onDelete,
  onUpdate,
  onDoubleClick,
  isSelected,
  onSelect,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cardSize] = useLocalStorage<'small' | 'medium' | 'large'>('cardSize', 'medium');

  const handleDoubleClick = () => {
    onDoubleClick(folder.id);
  };
  
  // Handle card selection for multi-select
  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger selection if we have a selection handler and the click wasn't on a button
    if (onSelect && !e.defaultPrevented && e.target instanceof Element) {
      const isClickOnButton = e.target.tagName === 'BUTTON' || e.target.closest('button') !== null;
      
      if (!isClickOnButton) {
        e.preventDefault();
        onSelect(folder.id, e.ctrlKey || e.metaKey || e.shiftKey);
      }
    }
  };
  
  const isLargeCard = cardSize === 'large';
  const folderNamePadding = isLargeCard ? 'left-[16%]' : 'left-[12%]';

  return (
    <Card 
      className={`overflow-hidden transition-shadow hover:shadow-lg relative h-full ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 h-full flex flex-col relative">
        {/* Container for the folder image with consistent aspect ratio */}
        <div className="w-full h-full relative">
          <AspectRatio ratio={3/2} className="large-card-height">
            <img
              src="/lovable-uploads/ee3d1214-9131-4ec4-9312-ddc55b3b8d6f.png"
              alt={folder.name}
              className="w-full h-[70%] object-contain mt-2" // Scaled down to better fit inside the card
            />
          </AspectRatio>
          
          {/* Folder name at top with increased left padding */}
          <div className={`absolute ${folderNamePadding} top-[6%] z-10`}>
            <span className="text-sm font-medium truncate text-amber-800 dark:text-amber-200">
              {folder.name}
            </span>
          </div>
          
          {/* Action buttons - rearranged with trash first, then edit */}
          <div className="absolute bottom-[3%] right-[6%] z-10 flex space-x-3">
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
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
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
          </div>
        </div>
      </CardContent>
      
      {/* Tags positioned at bottom left with more padding */}
      {folder.tags && folder.tags.length > 0 && (
        <div className="absolute bottom-[2%] left-[12%] right-[6%] z-10">
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
