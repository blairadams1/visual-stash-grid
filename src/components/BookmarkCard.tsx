
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
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
    const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);
    const [customThumbnailPreview, setCustomThumbnailPreview] = useState("");
    const [allBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
    const { toast } = useToast();

    // Get all unique tags from bookmarks for tag suggestions
    const allTags = React.useMemo(() => {
      return Array.from(
        new Set(allBookmarks.flatMap((bookmark) => bookmark.tags))
      ).sort();
    }, [allBookmarks]);

    // Filter out already selected tags
    const availableTags = React.useMemo(() => {
      const selectedTagsSet = new Set(editedTags.split(",").map(t => t.trim()).filter(t => t));
      return allTags.filter(tag => !selectedTagsSet.has(tag));
    }, [allTags, editedTags]);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCustomThumbnailFile(file);
        
        // Create a preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setCustomThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleTagClick = (tag: string) => {
      const currentTags = editedTags.split(",").map(t => t.trim()).filter(t => t);
      if (currentTags.includes(tag)) {
        // Remove the tag
        const newTags = currentTags.filter(t => t !== tag).join(", ");
        setEditedTags(newTags);
      } else {
        // Add the tag
        const newTags = [...currentTags, tag].join(", ");
        setEditedTags(newTags);
      }
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
      if (customThumbnailPreview) {
        updates.thumbnail = customThumbnailPreview;
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
              <DialogTitle className="bg-bookmark-blue text-white p-4 -mt-6 -mx-6 rounded-t-lg">Edit Bookmark</DialogTitle>
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
                <Label htmlFor="tags">Tags</Label>
                <Textarea
                  id="tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  placeholder="Tags separated by commas"
                  className="resize-none"
                  rows={2}
                />
                
                <div className="pt-2">
                  <Label>Available Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto p-2 border rounded-md">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {availableTags.length === 0 && (
                      <p className="text-sm text-gray-500 w-full text-center py-1">
                        No more tags available
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <Label>Current Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editedTags.split(",").map(tag => tag.trim()).filter(tag => tag).map(tag => (
                      <Badge
                        key={tag}
                        className="bg-bookmark-blue hover:bg-bookmark-darkBlue text-white"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    {!editedTags.trim() && (
                      <p className="text-sm text-gray-500 w-full py-1">
                        No tags selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Custom Thumbnail</Label>
                {customThumbnailPreview ? (
                  <div className="relative w-full h-32 mb-2">
                    <img 
                      src={customThumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCustomThumbnailPreview("");
                        setCustomThumbnailFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="mb-2">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
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
