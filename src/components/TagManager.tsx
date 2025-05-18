
import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags } from '@/hooks/useTags';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/lib/bookmarkUtils';
import { X, Plus, Search } from 'lucide-react';

const TagManager: React.FC = () => {
  const { toast } = useToast();
  const { tags, addTag, deleteTag } = useTags();
  const { bookmarks, updateBookmark } = useBookmarks();
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate tag usage counts
  const tagUsageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    bookmarks.forEach(bookmark => {
      if (bookmark.tags) {
        bookmark.tags.forEach(tag => {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        });
      }
    });
    return counts;
  }, [bookmarks]);

  // Get all unique tags from bookmarks
  const allTags = useMemo(() => {
    const tagList = Array.from(tagUsageCounts.keys());
    return tagList.sort((a, b) => (tagUsageCounts.get(b) || 0) - (tagUsageCounts.get(a) || 0));
  }, [tagUsageCounts]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTags, searchQuery]);

  // Validate tag
  const isValidTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag.length === 0) {
      toast({
        title: "Tag cannot be empty",
        variant: "destructive"
      });
      return false;
    }
    
    if (trimmedTag.length > 15) {
      toast({
        title: "Tag cannot be longer than 15 characters",
        variant: "destructive"
      });
      return false;
    }
    
    if (trimmedTag.includes('.')) {
      toast({
        title: "Tag cannot contain periods",
        variant: "destructive"
      });
      return false;
    }
    
    if (allTags.includes(trimmedTag)) {
      toast({
        title: "Tag already exists",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAddTag = () => {
    const trimmedTag = newTagName.trim().toLowerCase();
    
    if (!isValidTag(trimmedTag)) return;
    
    addTag(trimmedTag);
    setNewTagName("");
    toast({
      title: `Tag "${trimmedTag}" added successfully`
    });
  };

  const handleDeleteTag = (tagToDelete: string) => {
    // First, remove the tag from all bookmarks that have it
    let affectedCount = 0;
    
    bookmarks.forEach(bookmark => {
      if (bookmark.tags && bookmark.tags.includes(tagToDelete)) {
        affectedCount++;
        const updatedTags = bookmark.tags.filter(tag => tag !== tagToDelete);
        updateBookmark(bookmark.id, { ...bookmark, tags: updatedTags });
      }
    });
    
    // Then delete the tag from the tag list
    deleteTag(tagToDelete);
    
    toast({
      title: `Tag "${tagToDelete}" removed`,
      description: `Removed from ${affectedCount} bookmark${affectedCount !== 1 ? 's' : ''}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Add new tag..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTag();
            }
          }}
        />
        <Button
          onClick={handleAddTag}
          disabled={!newTagName.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-64 border rounded-md p-2">
        {filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-sm"
              >
                {tag}
                <span className="text-xs text-gray-500 mr-1">
                  ({tagUsageCounts.get(tag) || 0})
                </span>
                <button
                  onClick={() => handleDeleteTag(tag)}
                  className="hover:text-red-500 focus:outline-none"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No tags found{searchQuery ? " matching your search" : ""}
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default TagManager;
