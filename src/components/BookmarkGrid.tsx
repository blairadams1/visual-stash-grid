
import { Bookmark, Collection, Folder } from "@/lib/bookmarkUtils";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import GridItem from "./bookmark-grid/GridItem";
import { useFilterUtils } from "./bookmark-grid/FilterUtils";
import { getColumnClasses, getCardHeightClasses } from "./bookmark-grid/LayoutUtils";
import { useDragDrop, DragDropHandler } from "./bookmark-grid/DragDropHandler";
import { TouchHandler } from "./bookmark-grid/TouchHandler";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Button } from "./ui/button";
import { Trash2, X } from "lucide-react";

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

  // Get filtered bookmarks and folders
  const { bookmarks: filteredBookmarks, folders: filteredFolders } = getFilteredItems();
  
  // Combine and sort all items (folders first, then bookmarks)
  const allItems = [
    ...filteredFolders.map(folder => ({ item: folder, type: 'folder' as const })),
    ...filteredBookmarks.map(bookmark => ({ item: bookmark, type: 'bookmark' as const }))
  ].sort((a, b) => a.item.order - b.item.order);
  
  // Use multiselect hook
  const multiSelect = useMultiSelect<{id: string; type: string}>();
  
  // Set up key event listeners for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Activate multi-select mode when Shift key is pressed
      if (e.key === 'Shift') {
        multiSelect.startMultiSelect();
      }
      
      // Delete selected items when Delete key is pressed
      if (e.key === 'Delete' && multiSelect.hasSelection()) {
        handleDeleteSelected();
      }
      
      // Cancel selection with Escape
      if (e.key === 'Escape' && multiSelect.hasSelection()) {
        multiSelect.clearSelection();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Deactivate multi-select mode when Shift key is released
      if (e.key === 'Shift') {
        multiSelect.endMultiSelect();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [multiSelect]);

  // Handle item selection
  const handleSelectItem = (id: string, isMultiSelect: boolean, type: 'bookmark' | 'folder') => {
    // Map IDs to their types for tracking selection
    const itemsWithType = allItems.map(({ item, type }) => ({ id: item.id, type }));
    multiSelect.handleSelectItem(id, isMultiSelect, itemsWithType);
  };

  // Delete selected items
  const handleDeleteSelected = () => {
    if (!multiSelect.hasSelection()) return;
    
    if (confirm(`Are you sure you want to delete ${multiSelect.selectedItems.length} selected items?`)) {
      multiSelect.selectedItems.forEach(id => {
        // Find the item with this ID to determine if it's a bookmark or folder
        const itemInfo = allItems.find(item => item.item.id === id);
        if (itemInfo) {
          if (itemInfo.type === 'bookmark') {
            onDeleteBookmark(id);
          } else {
            onDeleteFolder(id);
          }
        }
      });
      multiSelect.clearSelection();
    }
  };

  // Get drag and drop handlers
  const dragDropHandlers = DragDropHandler({
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

  // Extract the handlers from the returned object
  const { 
    handleDragStart, 
    handleDragOver, 
    handleDragEnd: baseDragEnd, 
    handleDrop, 
    handleDragLeave 
  } = dragDropHandlers;

  // Wrap handleDragEnd to provide getFilteredItems
  const handleDragEnd = (event: React.DragEvent) => {
    baseDragEnd(event, getFilteredItems);
  };

  // Get touch handlers if on mobile
  const touchHandlers = TouchHandler({
    onBookmarksReordered,
    onMoveToFolder,
    bookmarks,
    getFilteredItems
  });

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = touchHandlers;

  // Get card height classes
  const heightClasses = getCardHeightClasses(cardSize);

  // Auto-refresh when items change
  useEffect(() => {
    // This will trigger a re-render with the latest data
    const triggerRefresh = () => {
      if (getFilteredItems) {
        const { bookmarks: refreshedBookmarks, folders: refreshedFolders } = getFilteredItems();
        // The component will re-render with fresh data
      }
    };
    
    // Set up event listener for bookmark changes
    window.addEventListener('bookmarkChange', triggerRefresh);
    
    return () => {
      window.removeEventListener('bookmarkChange', triggerRefresh);
    };
  }, [getFilteredItems]);

  return (
    <>
      {/* Multi-select action bar */}
      {multiSelect.hasSelection() && (
        <div className="sticky top-0 z-50 bg-blue-500 text-white py-2 px-4 mb-4 rounded flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium">{multiSelect.selectedItems.length} items selected</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => multiSelect.clearSelection()}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}
      
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
            heightClass={heightClasses}
            isSelected={multiSelect.isItemSelected(item.id)}
            onSelect={(id, isMultiSelect) => handleSelectItem(id, isMultiSelect, type)}
          />
        ))}
      </div>
    </>
  );
};

export default BookmarkGrid;
