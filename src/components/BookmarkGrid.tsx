import { Bookmark, Collection, Folder } from "@/lib/bookmarkUtils";
import BookmarkCard from "./BookmarkCard";
import FolderCard from "./FolderCard";
import { useState, useEffect } from "react";
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<'bookmark' | 'folder' | null>(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Add a class to the body when dragging to prevent scrolling
  useEffect(() => {
    if (draggedIndex !== null) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
    
    return () => {
      document.body.classList.remove('dragging');
    };
  }, [draggedIndex]);

  // Function to handle drag start for bookmarks
  const handleDragStart = (index: number, event: React.DragEvent, type: 'bookmark' | 'folder') => {
    setDraggedIndex(index);
    setDraggedType(type);
    
    // Set drag preview image (clone of the dragged element)
    if (event.dataTransfer) {
      // Cast the currentTarget to HTMLElement to access offsetWidth and offsetHeight
      const draggedElement = event.currentTarget as HTMLElement;
      const clone = draggedElement.cloneNode(true) as HTMLElement;
      
      // Style the clone
      clone.style.width = `${draggedElement.offsetWidth}px`;
      clone.style.height = `${draggedElement.offsetHeight}px`;
      clone.style.opacity = '0.6';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      clone.style.left = '-1000px';
      clone.style.border = '2px dashed #3b82f6';
      clone.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      clone.style.borderRadius = '8px';
      
      // Append clone to document body, set as drag image, then remove
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
      
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  // Function to handle drag over
  const handleDragOver = (event: React.DragEvent, index: number, type: 'bookmark' | 'folder' = 'bookmark', id?: string) => {
    event.preventDefault();
    setTargetIndex(index);
    
    // If dragging over a folder, highlight it as a drop target
    if (type === 'folder' && id) {
      setDraggedOverFolder(id);
    } else {
      setDraggedOverFolder(null);
    }
  };

  // Function to handle drag end
  const handleDragEnd = () => {
    if (draggedType === 'bookmark' && draggedIndex !== null) {
      // If bookmark is dropped on a folder
      if (draggedOverFolder !== null) {
        const draggedBookmark = bookmarks[draggedIndex];
        onMoveToFolder(draggedBookmark.id, draggedOverFolder);
      } 
      // If bookmark is reordered within the grid
      else if (targetIndex !== null && draggedIndex !== targetIndex) {
        // Create a copy of the bookmarks array
        const updatedBookmarks = [...bookmarks];
        
        // Get the bookmark that is being dragged
        const draggedBookmark = updatedBookmarks[draggedIndex];
        
        // Remove the bookmark from the old position
        updatedBookmarks.splice(draggedIndex, 1);
        
        // Insert the bookmark at the new position
        updatedBookmarks.splice(targetIndex, 0, draggedBookmark);
        
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
    setDraggedIndex(null);
    setTargetIndex(null);
    setDraggedType(null);
    setDraggedOverFolder(null);
  };

  // Touch events handling for mobile
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchEndIndex, setTouchEndIndex] = useState<number | null>(null);
  const [touchType, setTouchType] = useState<'bookmark' | 'folder' | null>(null);
  const [touchOverFolder, setTouchOverFolder] = useState<string | null>(null);

  const handleTouchStart = (index: number, type: 'bookmark' | 'folder') => {
    setTouchStartIndex(index);
    setTouchType(type);
  };

  const handleTouchMove = (event: React.TouchEvent, index: number, type: 'bookmark' | 'folder' = 'bookmark', id?: string) => {
    event.preventDefault();
    if (touchStartIndex !== null && (touchStartIndex !== index || type === 'folder')) {
      setTouchEndIndex(index);
      if (type === 'folder' && id) {
        setTouchOverFolder(id);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchType === 'bookmark' && touchStartIndex !== null) {
      // If dropping onto a folder
      if (touchOverFolder !== null) {
        const draggedBookmark = bookmarks[touchStartIndex];
        onMoveToFolder(draggedBookmark.id, touchOverFolder);
      }
      // If reordering
      else if (touchEndIndex !== null && touchStartIndex !== touchEndIndex) {
        // Create a copy of the bookmarks array
        const updatedBookmarks = [...bookmarks];
        
        // Get the bookmark that is being dragged
        const draggedBookmark = updatedBookmarks[touchStartIndex];
        
        // Remove the bookmark from the old position
        updatedBookmarks.splice(touchStartIndex, 1);
        
        // Insert the bookmark at the new position
        updatedBookmarks.splice(touchEndIndex, 0, draggedBookmark);
        
        // Update the order property
        const reorderedBookmarks = updatedBookmarks.map((bookmark, index) => ({
          ...bookmark,
          order: index,
        }));
        
        // Update the state in the parent component
        onBookmarksReordered(reorderedBookmarks);
      }
    }
    
    // Reset touch state
    setTouchStartIndex(null);
    setTouchEndIndex(null);
    setTouchType(null);
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
  
  // Determine column count based on card size and layout
  const getColumnClasses = () => {
    if (layout === 'list') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    
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
    <div className={`grid gap-4 px-0 mx-0 ${getColumnClasses()}`}>
      {allItems.map(({ item, type }, index) => (
        <div
          key={item.id}
          draggable={!isMobile}
          onDragStart={(e) => handleDragStart(index, e, type)}
          onDragOver={(e) => handleDragOver(e, index, type, type === 'folder' ? item.id : undefined)}
          onDragEnd={handleDragEnd}
          onTouchStart={() => isMobile && handleTouchStart(index, type)}
          onTouchMove={(e) => isMobile && handleTouchMove(e, index, type, type === 'folder' ? item.id : undefined)}
          onTouchEnd={() => isMobile && handleTouchEnd()}
          className={`transition-transform ${
            (draggedIndex === index && draggedType === type) ? "opacity-50 scale-105 z-10" : "opacity-100"
          } ${
            (targetIndex === index && draggedIndex !== index) || (type === 'folder' && draggedOverFolder === item.id)
              ? "border-2 border-bookmark-blue ring-2 ring-bookmark-blue/30 rounded-lg shadow-lg"
              : ""
          }`}
        >
          {type === 'bookmark' ? (
            <BookmarkCard
              bookmark={item as Bookmark}
              onTagClick={onTagClick}
              onDelete={onDeleteBookmark}
              onUpdate={onUpdateBookmark}
              layout={layout}
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
      ))}
    </div>
  );
};

export default BookmarkGrid;
