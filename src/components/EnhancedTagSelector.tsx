
import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Bookmark } from "@/lib/bookmarkUtils";
import { Search, X } from "lucide-react";

interface EnhancedTagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagDeselect: (tag: string) => void;
  onClearAllTags: () => void;
}

const EnhancedTagSelector: React.FC<EnhancedTagSelectorProps> = ({
  selectedTags,
  onTagSelect,
  onTagDeselect,
  onClearAllTags,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [bookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);

  // Get all unique tags from bookmarks and calculate popularity
  const tagCounts = useMemo(() => {
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

  // Get all unique tags sorted by popularity
  const allTags = useMemo(() => {
    return Array.from(tagCounts.keys())
      .sort((a, b) => (tagCounts.get(b) || 0) - (tagCounts.get(a) || 0));
  }, [tagCounts]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return allTags;
    
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTags, searchQuery]);

  // Calculate popular tags based on frequency
  const popularTags = useMemo(() => {
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count, descending
      .filter(([tag]) => !selectedTags.includes(tag))
      .slice(0, 15) // Get top 15 popular tags
      .map(([tag]) => tag);
  }, [tagCounts, selectedTags]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllTags}
            className="h-8 px-2"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              className="bg-bookmark-blue hover:bg-bookmark-darkBlue text-white px-3 py-1 flex items-center gap-1 cursor-pointer"
              onClick={() => onTagDeselect(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Tags tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Tags</TabsTrigger>
          <TabsTrigger value="popular">Popular Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTags.includes(tag)
                      ? "bg-bookmark-blue hover:bg-bookmark-darkBlue text-white flex items-center gap-1"
                      : "border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue"
                  }`}
                  onClick={() =>
                    selectedTags.includes(tag)
                      ? onTagDeselect(tag)
                      : onTagSelect(tag)
                  }
                >
                  {tag}
                  {selectedTags.includes(tag) && <X className="h-3 w-3" />}
                  <span className="text-xs ml-1">({tagCounts.get(tag) || 0})</span>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500 w-full text-center py-4">
                No tags found matching your search.
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="mt-4">
          <div className="flex flex-wrap gap-1">
            {popularTags.length > 0 ? (
              popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue"
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                  <span className="text-xs ml-1">({tagCounts.get(tag) || 0})</span>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500 w-full text-center py-4">
                No more popular tags available.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTagSelector;
