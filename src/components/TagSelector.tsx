
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  placeholder?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagSelect,
  onTagRemove,
  placeholder = "Add tag..."
}) => {
  const [tagInput, setTagInput] = useState<string>("");
  const { toast } = useToast();
  
  const validateTag = (tag: string): boolean => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag.length === 0) return false;
    
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
    
    if (selectedTags.includes(trimmedTag)) {
      toast({
        title: "This tag is already added",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (validateTag(tag)) {
      onTagSelect(tag);
      setTagInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddTag}
          variant="outline"
          disabled={!tagInput.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <button
                onClick={() => onTagRemove(tag)}
                className="hover:text-red-500 focus:outline-none"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
