
import { useState } from "react";
import { Bookmark } from "@/lib/bookmarkUtils";
import { DraggedItem, DropIndicator } from "./DragDropHandler";

interface TouchHandlerProps {
  onBookmarksReordered: (bookmarks: Bookmark[]) => void;
  onMoveToFolder: (bookmarkId: string, folderId: string) => void;
  bookmarks: Bookmark[];
  getFilteredItems: () => { bookmarks: Bookmark[], folders: any[] };
}

export const useTouchHandling = () => {
  const [touchStartPos, setTouchStartPos] = useState<DraggedItem>(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState<DropIndicator>({index: -1, position: null});
  const [touchOverFolder, setTouchOverFolder] = useState<string | null>(null);

  return {
    touchStartPos,
    setTouchStartPos,
    touchCurrentPos,
    setTouchCurrentPos,
    touchOverFolder,
    setTouchOverFolder
  };
};

export const TouchHandler = ({
  onBookmarksReordered,
  onMoveToFolder,
  bookmarks,
  getFilteredItems
}: TouchHandlerProps) => {
  const {
    touchStartPos, 
    setTouchStartPos,
    touchCurrentPos,
    setTouchCurrentPos,
    touchOverFolder,
    setTouchOverFolder
  } = useTouchHandling();

  const handleTouchStart = (index: number, type: 'bookmark' | 'folder', event: React.TouchEvent) => {
    setTouchStartPos({index, type});
    // Store initial touch position
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
        const centerX = rect.left + rect.width / 2;
        const position = touchX < centerX ? 'before' : 'after';
        
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
      const draggedBookmark = getFilteredItems().bookmarks[touchStartPos.index];
      onMoveToFolder(draggedBookmark.id, touchOverFolder);
    }
    // If reordering
    else if (touchCurrentPos.index !== -1 && touchCurrentPos.position !== null) {
      const draggedIndex = touchStartPos.index;
      const { index: dropIndex, position } = touchCurrentPos;
      
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
    
    // Reset touch state
    setTouchStartPos(null);
    setTouchCurrentPos({index: -1, position: null});
    setTouchOverFolder(null);
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
