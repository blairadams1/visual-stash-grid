
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Bookmark, Folder } from "@/lib/bookmarkUtils";

export type DraggedItem = {
  index: number;
  type: 'bookmark' | 'folder';
} | null;

export type DropIndicator = {
  index: number;
  position: 'before' | 'after' | null;
};

interface DragDropHandlerProps {
  onBookmarksReordered: (bookmarks: Bookmark[]) => void;
  onMoveToFolder: (bookmarkId: string, folderId: string) => void;
  bookmarks: Bookmark[];
  draggedItem: DraggedItem;
  setDraggedItem: Dispatch<SetStateAction<DraggedItem>>;
  dropIndicator: DropIndicator;
  setDropIndicator: Dispatch<SetStateAction<DropIndicator>>;
  draggedOverFolder: string | null;
  setDraggedOverFolder: Dispatch<SetStateAction<string | null>>;
}

export const useDragDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DraggedItem>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>({index: -1, position: null});
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);

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

  return {
    draggedItem,
    setDraggedItem,
    dropIndicator,
    setDropIndicator,
    draggedOverFolder,
    setDraggedOverFolder
  };
};

export const DragDropHandler: React.FC<DragDropHandlerProps> = ({
  onBookmarksReordered,
  onMoveToFolder,
  bookmarks,
  draggedItem,
  setDraggedItem,
  dropIndicator,
  setDropIndicator,
  draggedOverFolder,
  setDraggedOverFolder,
}) => {
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

  // Find the drop position based on mouse position relative to item being dragged over
  const findDropPosition = (event: React.DragEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX;
    
    // We only want vertical lines between items, so we'll determine if the mouse
    // is closer to the left or right edge of the card
    const centerX = rect.left + rect.width / 2;
    
    // Return "before" if mouse is on left half, "after" if on right half
    return mouseX < centerX ? 'before' : 'after';
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
    
    // Determine position (before or after) based on mouse position relative to element center
    const position = findDropPosition(event, element);
    
    // Update drop indicator position
    setDropIndicator({index, position});
  };

  // Function to handle drag end
  const handleDragEnd = (event: React.DragEvent, getFilteredItems: () => { bookmarks: Bookmark[], folders: Folder[] }) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedItem && draggedItem.type === 'bookmark') {
      const draggedIndex = draggedItem.index;
      const { index: dropIndex, position } = dropIndicator;
      
      // If bookmark is dropped on a folder
      if (draggedOverFolder !== null) {
        const draggedBookmark = getFilteredItems().bookmarks[draggedIndex];
        onMoveToFolder(draggedBookmark.id, draggedOverFolder);
      } 
      // If bookmark is reordered within the grid
      else if (dropIndex !== -1 && position !== null && draggedIndex !== dropIndex) {
        // Get filtered bookmarks to work with
        const filteredBooks = getFilteredItems().bookmarks;
        
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
    if (event.target === event.currentTarget) {
      setDropIndicator({index: -1, position: null});
      setDraggedOverFolder(null);
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleDragLeave
  };
};
