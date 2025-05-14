
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagDeselect: (tag: string) => void;
  onClearAllTags: () => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagDeselect,
  onClearAllTags,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Filter by Tags</h2>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllTags}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-2"
        />
      </div>
      
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              className="bg-bookmark-purple text-white px-3 cursor-pointer hover:bg-bookmark-darkPurple"
              onClick={() => onTagDeselect(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
      
      {/* Available tags */}
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        {filteredTags
          .filter((tag) => !selectedTags.includes(tag))
          .map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn(
                "cursor-pointer border-bookmark-purple text-bookmark-darkPurple hover:bg-bookmark-softPurple"
              )}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </Badge>
          ))}
      </div>
    </div>
  );
};

export default TagSelector;
