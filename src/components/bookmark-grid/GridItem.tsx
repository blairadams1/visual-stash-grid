
import React from "react";
import { Bookmark, Folder } from "@/lib/bookmarkUtils";
import BookmarkCard from "../BookmarkCard";
import FolderCard from "../FolderCard";
import { DraggedItem, DropIndicator } from "./DragDropHandler";

interface GridItemProps {
  item: Bookmark | Folder;
  type: 'bookmark' | 'folder';
  index: number;
  draggedItem: DraggedItem;
  dropIndicator: DropIndicator;
  draggedOverFolder: string | null;
  isMobile: boolean;
  onTagClick: (tag: string) => void;
  onDeleteBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  onDeleteFolder: (id: string) => void;
  onUpdateFolder: (id: string, updates: Partial<Folder>) => void;
  onOpenFolder: (folderId: string) => void;
  handleDragStart: (index: number, e: React.DragEvent, type: 'bookmark' | 'folder') => void;
  handleDragOver: (e: React.DragEvent, index: number, type: 'bookmark' | 'folder', id?: string) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleTouchStart?: (index: number, type: 'bookmark' | 'folder', e: React.TouchEvent) => void;
  handleTouchMove?: (e: React.TouchEvent, index: number, type: 'bookmark' | 'folder', id?: string) => void;
  handleTouchEnd?: (e: React.TouchEvent) => void;
  heightClass?: string;
  isSelected?: boolean; // New prop for multi-select
  onSelect?: (id: string, isMultiSelect: boolean) => void; // New prop for selection
}

const GridItem: React.FC<GridItemProps> = ({
  item,
  type,
  index,
  draggedItem,
  dropIndicator,
  draggedOverFolder,
  isMobile,
  onTagClick,
  onDeleteBookmark,
  onUpdateBookmark,
  onDeleteFolder,
  onUpdateFolder,
  onOpenFolder,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  heightClass = '',
  isSelected = false,
  onSelect
}) => {
  // Generate unique key for item
  const itemKey = `${type}-${item.id}`;
  
  // Determine if this item has a drop indicator
  const hasDropIndicator = draggedItem !== null && 
                          dropIndicator.index === index && 
                          dropIndicator.position !== null;
  
  // Is this the dragged item
  const isDragged = draggedItem !== null && 
                    draggedItem.index === index && 
                    draggedItem.type === type;
  
  // Is this item a folder that's being dragged over
  const isFolderTarget = type === 'folder' && 
                        draggedOverFolder === item.id;
  
  return (
    <div
      data-index={index}
      className={`bookmark-item relative ${type}-card ${
        isDragged ? "opacity-50" : "opacity-100"
      } ${
        isFolderTarget
          ? "ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          : ""
      } ${heightClass} w-full`}
      data-folder-id={type === 'folder' ? item.id : undefined}
      draggable={!isMobile}
      onDragStart={(e) => handleDragStart(index, e, type)}
      onDragOver={(e) => handleDragOver(e, index, type, type === 'folder' ? item.id : undefined)}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      onTouchStart={(e) => isMobile && handleTouchStart && handleTouchStart(index, type, e)}
      onTouchMove={(e) => isMobile && handleTouchMove && handleTouchMove(e, index, type, type === 'folder' ? item.id : undefined)}
      onTouchEnd={(e) => isMobile && handleTouchEnd && handleTouchEnd(e)}
    >
      {/* Drop indicator - displayed as a vertical line */}
      {hasDropIndicator && (
        <div 
          className={`absolute z-10 h-full w-1 bg-blue-500 ${
            dropIndicator.position === 'before' ? 'left-0' : 'right-0'
          }`}
        />
      )}
      
      {type === 'bookmark' ? (
        <BookmarkCard
          bookmark={item as Bookmark}
          onTagClick={onTagClick}
          onDelete={onDeleteBookmark}
          onUpdate={onUpdateBookmark}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      ) : (
        <FolderCard
          folder={item as Folder}
          onTagClick={onTagClick}
          onDelete={onDeleteFolder}
          onUpdate={onUpdateFolder}
          onDoubleClick={onOpenFolder}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default GridItem;
