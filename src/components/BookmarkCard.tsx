
import { Bookmark } from "@/lib/bookmarkUtils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generatePlaceholderThumbnail } from "@/lib/bookmarkUtils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
        className="group relative overflow-hidden rounded-lg shadow-md h-52 cursor-grab active:cursor-grabbing"
      >
        <AspectRatio ratio={16 / 9} className="h-full w-full">
          <img
            src={imageError ? generatePlaceholderThumbnail() : bookmark.thumbnail}
            alt={bookmark.title}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
            />
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="text-sm font-medium line-clamp-1 mb-2">
              {bookmark.title}
            </h3>
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs bg-black/20 hover:bg-bookmark-blue text-white border-white/20 hover:text-white hover:border-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                >
                  {tag}
                </Button>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-xs text-gray-300 flex items-center">
                  +{bookmark.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </AspectRatio>

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
