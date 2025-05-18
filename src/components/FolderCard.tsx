
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
  
  // Determine styles based on card size
  const isSmallCard = cardSize === 'small';
  const isMediumCard = cardSize === 'medium';
  const isLargeCard = cardSize === 'large';

  // Improved positioning for folder name and content
  const getFolderNameClass = () => {
    if (isLargeCard) {
      return 'top-6 text-base';
    } else if (isMediumCard) {
      return 'top-4 text-sm';
    } else {
      return 'top-2 text-xs';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-shadow hover:shadow-lg relative h-full ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 h-full flex flex-col relative">
        {/* Container for the folder image with consistent aspect ratio */}
        <AspectRatio ratio={3/2} className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/lovable-uploads/ee3d1214-9131-4ec4-9312-ddc55b3b8d6f.png"
              alt={folder.name}
              className="w-[85%] h-[85%] object-contain" // Increased size for better visibility
            />
          </div>
          
          {/* Folder name at top with better positioning */}
          <div className={`absolute left-0 right-0 px-4 ${getFolderNameClass()} z-10 text-center`}>
            <span className="font-medium truncate text-amber-800 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-900/70 px-2 py-1 rounded">
              {folder.name}
            </span>
          </div>
          
          {/* Action buttons - positioned at bottom right */}
          <div className="absolute bottom-2 right-2 z-10 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 bg-white/80 dark:bg-gray-800/80 text-red-500 hover:text-red-700 rounded-full"
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
                  className="h-7 w-7 p-0 bg-white/80 dark:bg-gray-800/80 rounded-full"
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
        </AspectRatio>
      </CardContent>
      
      {/* Tags positioned at bottom left with better visibility */}
      {folder.tags && folder.tags.length > 0 && (
        <div className="absolute bottom-2 left-0 right-12 z-10 px-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            {folder.tags.slice(0, isSmallCard ? 2 : isLargeCard ? 6 : 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={`${isSmallCard ? 'text-[10px]' : 'text-xs'} cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 bg-white/80 dark:bg-gray-800/80`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
            {folder.tags.length > (isSmallCard ? 2 : isLargeCard ? 6 : 4) && (
              <span className={`${isSmallCard ? 'text-[10px]' : 'text-xs'} text-gray-600 dark:text-gray-300`}>
                +{folder.tags.length - (isSmallCard ? 2 : isLargeCard ? 6 : 4)}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FolderCard;
