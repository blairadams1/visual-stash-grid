
import { Bookmark, Collection, Folder } from "@/lib/bookmarkUtils";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import GridItem from "./bookmark-grid/GridItem";
import { useFilterUtils } from "./bookmark-grid/FilterUtils";
import { getColumnClasses } from "./bookmark-grid/LayoutUtils";
import { useDragDrop, DragDropHandler } from "./bookmark-grid/DragDropHandler";
import { TouchHandler } from "./bookmark-grid/TouchHandler";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  folders?: Folder[];
  onBookmarksReordered: (bookmarks: Bookmark[]) => void;
  onTagClick: (tag: string) => void;
  onDeleteBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  onDeleteFolder?: (id: string) => void;
  onUpdateFolder?: (id: string, updates: Partial<Folder>) => void;
  onOpenFolder?: (folderId: string) => void;
  onMoveToFolder?: (bookmarkId: string, folderId: string) => void;
  selectedCollectionId?: string | null;
  collections?: Collection[];
  layout?: 'grid' | 'list' | 'compact';
  cardSize?: string;
  currentFolderId?: string | null;
  selectedTags?: string[];
  searchQuery?: string;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  folders = [],
  onBookmarksReordered,
  onTagClick,
  onDeleteBookmark,
  onUpdateBookmark,
  onDeleteFolder = () => {},
  onUpdateFolder = () => {},
  onOpenFolder = () => {},
  onMoveToFolder = () => {},
  selectedCollectionId = null,
  collections = [],
  layout = 'grid',
  cardSize = 'medium',
  currentFolderId = null,
  selectedTags = [],
  searchQuery = '',
}) => {
  // Grid reference for drag and drop operations
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Use our custom hooks
  const { 
    draggedItem, 
    setDraggedItem, 
    dropIndicator, 
    setDropIndicator, 
    draggedOverFolder, 
    setDraggedOverFolder 
  } = useDragDrop();

  // Get the filtering utility
  const { getFilteredItems } = useFilterUtils(
    bookmarks,
    folders,
    selectedCollectionId,
    currentFolderId,
    selectedTags,
    searchQuery,
    collections
  );

  // Get drag and drop handlers
  const { 
    handleDragStart, 
    handleDragOver, 
    handleDragEnd: baseDragEnd, 
    handleDrop, 
    handleDragLeave 
  } = DragDropHandler({
    onBookmarksReordered,
    onMoveToFolder,
    bookmarks,
    draggedItem, 
    setDraggedItem,
    dropIndicator,
    setDropIndicator,
    draggedOverFolder,
    setDraggedOverFolder
  });

  // Wrap handleDragEnd to provide getFilteredItems
  const handleDragEnd = (event: React.DragEvent) => {
    baseDragEnd(event, getFilteredItems);
  };

  // Get touch handlers if on mobile
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = TouchHandler({
    onBookmarksReordered,
    onMoveToFolder,
    bookmarks,
    getFilteredItems
  });

  // Get filtered bookmarks and folders
  const { bookmarks: filteredBookmarks, folders: filteredFolders } = getFilteredItems();
  
  // Combine and sort all items (folders first, then bookmarks)
  const allItems = [
    ...filteredFolders.map(folder => ({ item: folder, type: 'folder' as const })),
    ...filteredBookmarks.map(bookmark => ({ item: bookmark, type: 'bookmark' as const }))
  ].sort((a, b) => a.item.order - b.item.order);

  return (
    <div 
      ref={gridRef}
      className={`grid gap-4 px-0 mx-0 ${getColumnClasses(layout, cardSize)} ${layout === 'list' ? 'bookmark-grid-list' : layout === 'compact' ? 'bookmark-grid-compact' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {allItems.map(({ item, type }, index) => (
        <GridItem
          key={`${type}-${item.id}`}
          item={item}
          type={type}
          index={index}
          draggedItem={draggedItem}
          dropIndicator={dropIndicator}
          draggedOverFolder={draggedOverFolder}
          isMobile={isMobile}
          onTagClick={onTagClick}
          onDeleteBookmark={onDeleteBookmark}
          onUpdateBookmark={onUpdateBookmark}
          onDeleteFolder={onDeleteFolder}
          onUpdateFolder={onUpdateFolder}
          onOpenFolder={onOpenFolder}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragEnd={handleDragEnd}
          handleDrop={handleDrop}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
        />
      ))}
    </div>
  );
};

export default BookmarkGrid;
