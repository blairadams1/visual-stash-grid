
import { Bookmark } from "@/lib/bookmarkUtils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generatePlaceholderThumbnail } from "@/lib/bookmarkUtils";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Bookmark>) => void;
}

const BookmarkCard = React.forwardRef<HTMLDivElement, BookmarkCardProps>(
  ({ bookmark, onTagClick, onDelete, onUpdate }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editedTitle, setEditedTitle] = useState(bookmark.title);
    const [editedUrl, setEditedUrl] = useState(bookmark.url);
    const [editedTags, setEditedTags] = useState(bookmark.tags.join(", "));
    const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
    const { toast } = useToast();

    const handleImageError = () => {
      setImageError(true);
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditDialogOpen(true);
    };

    const handleSave = () => {
      if (!onUpdate) return;
      
      // Process the edited tags
      const processedTags = editedTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      
      const updates: Partial<Bookmark> = {
        title: editedTitle,
        url: editedUrl,
        tags: processedTags,
      };
      
      // Add custom thumbnail if provided
      if (customThumbnailUrl) {
        updates.thumbnail = customThumbnailUrl;
      }
      
      onUpdate(bookmark.id, updates);
      setIsEditDialogOpen(false);
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been updated successfully",
      });
    };

    return (
      <>
        <Card
          ref={ref}
          className="group relative overflow-hidden rounded-lg shadow-md h-52 cursor-grab active:cursor-grabbing"
        >
          <div className="absolute inset-0">
            <img
              src={imageError ? generatePlaceholderThumbnail() : bookmark.thumbnail}
              alt={bookmark.title}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay - moved down 20% as requested */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              />
            </div>

            {/* Settings icon */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white hover:bg-black/40 p-1.5 h-8 w-8"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="text-sm font-medium line-clamp-1 mb-2">
                {bookmark.title}
              </h3>
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 5).map((tag) => (
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
                {bookmark.tags.length > 5 && (
                  <span className="text-xs text-gray-300 flex items-center">
                    +{bookmark.tags.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delete button - visible on hover */}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(bookmark.id);
            }}
          >
            ×
          </Button>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Bookmark</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Custom Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail"
                  placeholder="https://example.com/image.jpg"
                  value={customThumbnailUrl}
                  onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

BookmarkCard.displayName = "BookmarkCard";

export default BookmarkCard;
