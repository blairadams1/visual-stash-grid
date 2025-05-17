
import { Bookmark } from "@/lib/bookmarkUtils";
import BookmarkCard from "./BookmarkCard";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onBookmarksReordered: (bookmarks: Bookmark[]) => void;
  onTagClick: (tag: string) => void;
  onDeleteBookmark: (id: string) => void;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  onBookmarksReordered,
  onTagClick,
  onDeleteBookmark,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
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

  // Function to handle drag start
  const handleDragStart = (index: number, event: React.DragEvent) => {
    setDraggedIndex(index);
    
    // Set drag preview image (clone of the dragged element)
    if (event.dataTransfer) {
      const draggedElement = event.currentTarget;
      const clone = draggedElement.cloneNode(true) as HTMLElement;
      
      // Style the clone
      clone.style.width = `${draggedElement.offsetWidth}px`;
      clone.style.height = `${draggedElement.offsetHeight}px`;
      clone.style.opacity = '0.6';
      clone.style.position = 'absolute';
      clone.style.top = '-1000px';
      clone.style.left = '-1000px';
      
      // Append clone to document body, set as drag image, then remove
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
      
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  // Function to handle drag over
  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setTargetIndex(index);
  };

  // Function to handle drag end
  const handleDragEnd = () => {
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
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
    
    // Reset drag state
    setDraggedIndex(null);
    setTargetIndex(null);
  };

  // Touch events handling for mobile
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchEndIndex, setTouchEndIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number) => {
    setTouchStartIndex(index);
  };

  const handleTouchMove = (event: React.TouchEvent, index: number) => {
    event.preventDefault();
    if (touchStartIndex !== null && touchStartIndex !== index) {
      setTouchEndIndex(index);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIndex !== null && touchEndIndex !== null && touchStartIndex !== touchEndIndex) {
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
    
    // Reset touch state
    setTouchStartIndex(null);
    setTouchEndIndex(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-1">
      {bookmarks.map((bookmark, index) => (
        <div
          key={bookmark.id}
          draggable={!isMobile}
          onDragStart={(e) => handleDragStart(index, e)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onTouchStart={() => isMobile && handleTouchStart(index)}
          onTouchMove={(e) => isMobile && handleTouchMove(e, index)}
          onTouchEnd={() => isMobile && handleTouchEnd()}
          className={`transition-transform ${
            draggedIndex === index ? "opacity-50 scale-105 z-10" : "opacity-100"
          } ${
            targetIndex === index && draggedIndex !== index
              ? "border-2 border-bookmark-blue ring-2 ring-bookmark-blue/30 rounded-lg shadow-lg"
              : ""
          }`}
        >
          <BookmarkCard
            bookmark={bookmark}
            onTagClick={onTagClick}
            onDelete={onDeleteBookmark}
          />
        </div>
      ))}
    </div>
  );
};

export default BookmarkGrid;
