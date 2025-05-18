import { Bookmark, Collection, Folder } from "@/lib/bookmarkUtils";
import BookmarkCard from "./BookmarkCard";
import FolderCard from "./FolderCard";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
}) => {
  // State for drag and drop
  const [draggedItem, setDraggedItem] = useState<{index: number, type: 'bookmark' | 'folder'} | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{index: number, position: 'before' | 'after' | null}>({index: -1, position: null});
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Add a class to the body when dragging to prevent scrolling
  useEffect(() => {
    if (draggedItem !== null) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
    
    return () => {
      document.body.classList.remove('dragging');
    };
  }, [draggedItem]);

  // Function to handle drag start for bookmarks and folders
  const handleDragStart = (index: number, event: React.DragEvent, type: 'bookmark' | 'folder') => {
    event.stopPropagation();
    setDraggedItem({index, type});
    
    // Set drag preview image (clone of the dragged element)
    if (event.dataTransfer) {
      // Cast the currentTarget to HTMLElement to access offsetWidth and offsetHeight
      const draggedElement = event.currentTarget as HTMLElement;
      const clone = draggedElement.cloneNode(true) as HTMLElement;
      
      // Style the clone - more subtle
      clone.style.width = `${draggedElement.offsetWidth}px`;
      clone.style.height = `${draggedElement.offsetHeight}px`;
      clone.style.opacity = '0.6';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      clone.style.left = '-1000px';
      clone.style.border = '1px solid #3b82f6';
      clone.style.backgroundColor = 'transparent';
      clone.style.borderRadius = '8px';
      
      // Append clone to document body, set as drag image, then remove
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
      
      // Add data to dataTransfer to enable drag and drop
      event.dataTransfer.setData('text/plain', index.toString());
      
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  // Find the closest position for drop indicator
  const findDropPosition = (event: React.DragEvent, elementRect: DOMRect) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Compare distances to left and right edges
    const distanceFromLeft = mouseX - elementRect.left;
    const distanceFromRight = elementRect.right - mouseX;
    
    return distanceFromLeft < distanceFromRight ? 'before' : 'after';
  };

  // Function to handle drag over
  const handleDragOver = (event: React.DragEvent, index: number, type: 'bookmark' | 'folder' = 'bookmark', id?: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Don't update anything if the user is dragging over the currently dragged item
    if (draggedItem && draggedItem.index === index && draggedItem.type === type) {
      setDropIndicator({index: -1, position: null});
      return;
    }
    
    // If dragging over a folder, highlight it as a drop target
    if (type === 'folder' && id) {
      setDraggedOverFolder(id);
      setDropIndicator({index: -1, position: null});
      return;
    }
    
    setDraggedOverFolder(null);
    
    // Get the element being dragged over for positional calculations
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    // Determine position (before or after) based on mouse position relative to element center
    const position = findDropPosition(event, rect);
    
    // Update drop indicator position
    setDropIndicator({index, position});
  };

  // Function to handle drag end
  const handleDragEnd = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedItem && draggedItem.type === 'bookmark') {
      const draggedIndex = draggedItem.index;
      const { index: dropIndex, position } = dropIndicator;
      
      // If bookmark is dropped on a folder
      if (draggedOverFolder !== null) {
        const draggedBookmark = getFilteredBookmarks()[draggedIndex];
        onMoveToFolder(draggedBookmark.id, draggedOverFolder);
      } 
      // If bookmark is reordered within the grid
      else if (dropIndex !== -1 && position !== null && draggedIndex !== dropIndex) {
        // Get filtered bookmarks to work with
        const filteredBooks = getFilteredBookmarks();
        
        // Create a copy of all bookmarks
        const updatedBookmarks = [...bookmarks];
        
        // Get the bookmark that is being dragged
        const draggedBookmark = filteredBooks[draggedIndex];
        
        // Find the index of the dragged bookmark in the full bookmarks array
        const draggedFullIndex = updatedBookmarks.findIndex(b => b.id === draggedBookmark.id);
        
        // Get the drop target bookmark
        const targetBookmark = filteredBooks[dropIndex];
        
        // Find the index of the target bookmark in the full bookmarks array
        const targetFullIndex = updatedBookmarks.findIndex(b => b.id === targetBookmark.id);
        
        // Calculate the insertion index based on position
        let insertionIndex = position === 'before' ? targetFullIndex : targetFullIndex + 1;
        
        // If we're moving an item forward in the list, we need to adjust for the item removal
        if (draggedFullIndex < insertionIndex) {
          insertionIndex--;
        }
        
        // Remove the bookmark from the old position
        updatedBookmarks.splice(draggedFullIndex, 1);
        
        // Insert the bookmark at the new position
        updatedBookmarks.splice(insertionIndex, 0, draggedBookmark);
        
        // Update the order property
        const reorderedBookmarks = updatedBookmarks.map((bookmark, index) => ({
          ...bookmark,
          order: index,
        }));
        
        // Update the state in the parent component
        onBookmarksReordered(reorderedBookmarks);
      }
    }
    
    // Reset drag state
    setDraggedItem(null);
    setDropIndicator({index: -1, position: null});
    setDraggedOverFolder(null);
  };
  
  // Add a drop handler to ensure drag end fires properly
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Clear indicators when dragleave
  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear indicators if we're leaving the grid itself, not moving between items
    if (event.currentTarget === gridRef.current) {
      setDropIndicator({index: -1, position: null});
      setDraggedOverFolder(null);
    }
  };

  // Touch events handling for mobile
  const [touchStartPos, setTouchStartPos] = useState<{index: number, type: 'bookmark' | 'folder'} | null>(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState<{index: number, position: 'before' | 'after' | null}>({index: -1, position: null});
  const [touchOverFolder, setTouchOverFolder] = useState<string | null>(null);

  const handleTouchStart = (index: number, type: 'bookmark' | 'folder', event: React.TouchEvent) => {
    setTouchStartPos({index, type});
    // Store initial touch position
    const touch = event.touches[0];
    const element = event.currentTarget as HTMLElement;
    element.classList.add('opacity-50');
  };

  const handleTouchMove = (event: React.TouchEvent, index: number, type: 'bookmark' | 'folder' = 'bookmark', id?: string) => {
    if (!touchStartPos) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Check if we're over a folder
    const folderElement = elementsAtPoint.find(el => 
      el.classList.contains('folder-card') && el.getAttribute('data-folder-id')
    );
    
    if (folderElement && type === 'folder') {
      const folderId = folderElement.getAttribute('data-folder-id');
      if (folderId) {
        setTouchOverFolder(folderId);
        setTouchCurrentPos({index: -1, position: null});
        return;
      }
    } else {
      setTouchOverFolder(null);
    }
    
    // Find the bookmark element under the touch point
    const bookmarkElement = elementsAtPoint.find(el => 
      el.classList.contains('bookmark-item') && 
      el !== event.currentTarget
    ) as HTMLElement;
    
    if (bookmarkElement) {
      const rect = bookmarkElement.getBoundingClientRect();
      const itemIndex = parseInt(bookmarkElement.getAttribute('data-index') || '-1');
      
      if (itemIndex !== -1) {
        // Determine position (before or after)
        const touchX = touch.clientX;
        const position = touchX < (rect.left + rect.width / 2) ? 'before' : 'after';
        
        setTouchCurrentPos({index: itemIndex, position});
      }
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStartPos) return;
    
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('opacity-50');
    
    // If dropped on a folder
    if (touchOverFolder !== null) {
      const draggedBookmark = getFilteredBookmarks()[touchStartPos.index];
      onMoveToFolder(draggedBookmark.id, touchOverFolder);
    }
    // If reordering
    else if (touchCurrentPos.index !== -1 && touchCurrentPos.position !== null) {
      const draggedIndex = touchStartPos.index;
      const { index: dropIndex, position } = touchCurrentPos;
      
      // Get filtered bookmarks to work with
      const filteredBooks = getFilteredBookmarks();
      
      // Create a copy of all bookmarks
      const updatedBookmarks = [...bookmarks];
      
      // Get the bookmark that is being dragged
      const draggedBookmark = filteredBooks[draggedIndex];
      
      // Find the index of the dragged bookmark in the full bookmarks array
      const draggedFullIndex = updatedBookmarks.findIndex(b => b.id === draggedBookmark.id);
      
      // Get the drop target bookmark
      const targetBookmark = filteredBooks[dropIndex];
      
      // Find the index of the target bookmark in the full bookmarks array
      const targetFullIndex = updatedBookmarks.findIndex(b => b.id === targetBookmark.id);
      
      // Calculate the insertion index based on position
      let insertionIndex = position === 'before' ? targetFullIndex : targetFullIndex + 1;
      
      // If we're moving an item forward in the list, we need to adjust for the item removal
      if (draggedFullIndex < insertionIndex) {
        insertionIndex--;
      }
      
      // Remove the bookmark from the old position
      updatedBookmarks.splice(draggedFullIndex, 1);
      
      // Insert the bookmark at the new position
      updatedBookmarks.splice(insertionIndex, 0, draggedBookmark);
      
      // Update the order property
      const reorderedBookmarks = updatedBookmarks.map((bookmark, index) => ({
        ...bookmark,
        order: index,
      }));
      
      // Update the state in the parent component
      onBookmarksReordered(reorderedBookmarks);
    }
    
    // Reset touch state
    setTouchStartPos(null);
    setTouchCurrentPos({index: -1, position: null});
    setTouchOverFolder(null);
  };

  // Filter and group bookmarks by collection and folder
  const getFilteredBookmarks = () => {
    let filtered = [...bookmarks];
    
    // Filter by collection if selected
    if (selectedCollectionId) {
      const subCollectionIds = getSubCollectionIds(selectedCollectionId);
      filtered = filtered.filter(
        bookmark => bookmark.collectionId === selectedCollectionId || 
                  (bookmark.collectionId && subCollectionIds.includes(bookmark.collectionId))
      );
    }
    
    // Filter by current folder if set
    if (currentFolderId !== null) {
      filtered = filtered.filter(bookmark => bookmark.folderId === currentFolderId);
    } else {
      // If not in a folder view, only show bookmarks that are not in any folder
      filtered = filtered.filter(bookmark => !bookmark.folderId);
    }
    
    return filtered;
  };
  
  // Get filtered folders based on selected collection
  const getFilteredFolders = () => {
    if (currentFolderId !== null) {
      // Don't show folders when inside a folder
      return [];
    }
    
    let filtered = [...folders];
    
    // Filter by collection if selected
    if (selectedCollectionId) {
      const subCollectionIds = getSubCollectionIds(selectedCollectionId);
      filtered = filtered.filter(
        folder => folder.collectionId === selectedCollectionId || 
                 (folder.collectionId && subCollectionIds.includes(folder.collectionId))
      );
    }
    
    return filtered;
  };
  
  // Function to get all subcollection IDs recursively
  const getSubCollectionIds = (parentId: string): string[] => {
    const result: string[] = [];
    
    const childCollections = collections.filter(c => c.parentId === parentId);
    childCollections.forEach(collection => {
      result.push(collection.id);
      result.push(...getSubCollectionIds(collection.id));
    });
    
    return result;
  };

  // Get filtered bookmarks and folders
  const filteredBookmarks = getFilteredBookmarks();
  const filteredFolders = getFilteredFolders();
  
  // Combine and sort all items (folders first, then bookmarks)
  const allItems = [
    ...filteredFolders.map(folder => ({ item: folder, type: 'folder' as const })),
    ...filteredBookmarks.map(bookmark => ({ item: bookmark, type: 'bookmark' as const }))
  ].sort((a, b) => a.item.order - b.item.order);
  
  // Determine column count based on card size
  const getColumnClasses = () => {
    if (layout === 'list') return 'grid-cols-1';
    
    switch (cardSize) {
      case 'small':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';
      case 'large':
        return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2';
      default: // medium
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5';
    }
  };

  return (
    <div 
      ref={gridRef}
      className={`grid gap-4 px-0 mx-0 ${getColumnClasses()} ${layout === 'list' ? 'bookmark-grid-list' : layout === 'compact' ? 'bookmark-grid-compact' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {allItems.map(({ item, type }, index) => {
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
            key={itemKey}
            data-index={index}
            className={`bookmark-item relative ${type}-card ${
              isDragged ? "opacity-50" : "opacity-100"
            } ${
              isFolderTarget
                ? "ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : ""
            }`}
            data-folder-id={type === 'folder' ? item.id : undefined}
            draggable={!isMobile}
            onDragStart={(e) => handleDragStart(index, e, type)}
            onDragOver={(e) => handleDragOver(e, index, type, type === 'folder' ? item.id : undefined)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onTouchStart={(e) => isMobile && handleTouchStart(index, type, e)}
            onTouchMove={(e) => isMobile && handleTouchMove(e, index, type, type === 'folder' ? item.id : undefined)}
            onTouchEnd={(e) => isMobile && handleTouchEnd(e)}
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
              />
            ) : (
              <FolderCard
                folder={item as Folder}
                onTagClick={onTagClick}
                onDelete={onDeleteFolder}
                onUpdate={onUpdateFolder}
                onDoubleClick={onOpenFolder}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookmarkGrid;
