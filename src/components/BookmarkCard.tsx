
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
import { AspectRatio } from "./ui/aspect-ratio";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Bookmark>) => void;
  isSelected?: boolean; // New prop for multi-select
  onSelect?: (id: string, isMultiSelect: boolean) => void; // New prop for selection
}

const BookmarkCard = React.forwardRef<HTMLDivElement, BookmarkCardProps>(
  ({ bookmark, onTagClick, onDelete, onUpdate, isSelected, onSelect }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editedTitle, setEditedTitle] = useState(bookmark.title);
    const [editedUrl, setEditedUrl] = useState(bookmark.url);
    const [editedTags, setEditedTags] = useState(bookmark.tags.join(", "));
    const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);
    const [customThumbnailPreview, setCustomThumbnailPreview] = useState("");
    const [editedNotes, setEditedNotes] = useState(bookmark.notes || "");
    const [allBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
    const { toast } = useToast();
    const [cardSize] = useLocalStorage<'small' | 'medium' | 'large'>('cardSize', 'medium');

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
        notes: editedNotes
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

    // Handle card selection for multi-select
    const handleCardClick = (e: React.MouseEvent) => {
      // Only trigger selection if we have a selection handler and the click wasn't on a button or link
      if (onSelect && !e.defaultPrevented && e.target instanceof Element) {
        const isClickOnInteractive = ['BUTTON', 'A'].includes(e.target.tagName) ||
                                    e.target.closest('button') !== null ||
                                    e.target.closest('a') !== null;
        
        if (!isClickOnInteractive) {
          e.preventDefault();
          onSelect(bookmark.id, e.ctrlKey || e.metaKey || e.shiftKey);
        }
      }
    };

    // Different styles based on card size
    const isLargeCard = cardSize === 'large';
    const contentPositionClass = isLargeCard ? 'bottom-6 left-0 right-0 px-6' : 'bottom-0 left-0 right-0 p-3';
    const titleClass = isLargeCard ? 'text-base font-medium mb-3' : 'text-sm font-medium line-clamp-1 mb-2';

    return (
      <>
        <Card
          ref={ref}
          className={`group relative overflow-hidden rounded-lg shadow-md h-full w-full cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          onClick={handleCardClick}
        >
          <AspectRatio ratio={3/2}>
            <div className="absolute inset-0">
              <img
                src={imageError ? generatePlaceholderThumbnail() : bookmark.thumbnail}
                alt={bookmark.title}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/80 to-transparent">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                />
              </div>

              {/* Settings button - left side */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bookmark-blue/20 text-white hover:bg-bookmark-blue/40 p-1.5 h-8 w-8 backdrop-blur-sm"
                onClick={handleSettingsClick}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Content overlay - positioned differently based on card size */}
              <div className={`absolute ${contentPositionClass} text-white`}>
                <h3 className={titleClass}>
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
                
                {/* Notes indicator if present */}
                {bookmark.notes && (
                  <div className="mt-2 text-xs text-gray-300">
                    <span className="bg-white/20 px-1 py-0.5 rounded">Note</span>
                  </div>
                )}
              </div>
            </div>
          </AspectRatio>

          {/* Delete button - right side */}
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes about this bookmark"
                  className="resize-none"
                  rows={3}
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
