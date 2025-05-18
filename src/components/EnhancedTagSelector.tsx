
import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tag, X } from "lucide-react";
import { useTags } from "@/hooks/useTags";

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
  const [searchTerm, setSearchTerm] = useState("");
  const { allTags } = useTags();

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTags, searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        {/* Clear all button moved up */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAllTags}
          disabled={selectedTags.length === 0}
          className="px-2 h-8"
        >
          Clear All
        </Button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTagDeselect(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      <Separator />

      {/* All tags */}
      <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "hover:bg-muted"
              }`}
              onClick={() =>
                selectedTags.includes(tag)
                  ? onTagDeselect(tag)
                  : onTagSelect(tag)
              }
            >
              {tag}
            </Badge>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No matching tags found</p>
        )}
      </div>
    </div>
  );
};

export default EnhancedTagSelector;
