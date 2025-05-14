
import { Bookmark } from "@/lib/bookmarkUtils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generatePlaceholderThumbnail } from "@/lib/bookmarkUtils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
}

const BookmarkCard = React.forwardRef<HTMLDivElement, BookmarkCardProps>(
  ({ bookmark, onTagClick, onDelete }, ref) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <Card
        ref={ref}
        className="group relative overflow-hidden rounded-lg shadow-md h-64 cursor-grab active:cursor-grabbing"
      >
        {/* Thumbnail */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-40 overflow-hidden"
        >
          <img
            src={imageError ? generatePlaceholderThumbnail() : bookmark.thumbnail}
            alt={bookmark.title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </a>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-1 mb-1">
            {bookmark.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-bookmark-softPurple hover:bg-bookmark-purple hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  onTagClick(tag);
                }}
              >
                {tag}
              </Button>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-gray-500 flex items-center">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Delete button - visible on hover */}
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(bookmark.id);
          }}
        >
          ×
        </Button>
      </Card>
    );
  }
);

BookmarkCard.displayName = "BookmarkCard";

export default BookmarkCard;
