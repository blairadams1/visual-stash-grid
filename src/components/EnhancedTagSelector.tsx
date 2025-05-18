import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useTags } from "@/hooks/useTags";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Bookmark } from "@/lib/bookmarkUtils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const { tags, categories, addTag, addCategory } = useTags();
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#9b87f5");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  // Get bookmarks to calculate popular tags
  const [bookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);

  // Get unique tag names from all tags (for backward compatibility)
  const allTagNames = useMemo(() => {
    const tagNames = new Set<string>();
    
    // First, add tags from the tags array
    tags.forEach(tag => tagNames.add(tag.name));
    
    // Then, add any other tags that might be referenced only by name
    selectedTags.forEach(tag => tagNames.add(tag));
    
    // Also add tags from bookmarks
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tagNames.add(tag));
    });
    
    return Array.from(tagNames).sort();
  }, [tags, selectedTags, bookmarks]);

  const filteredTags = allTagNames.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate popular tags based on frequency in bookmarks
  const popularTags = useMemo(() => {
    return Array.from(
      new Set(bookmarks.flatMap((bookmark) => bookmark.tags))
    )
      .sort((a, b) => {
        // Count occurrences of each tag
        const countA = bookmarks.filter(bm => bm.tags.includes(a)).length;
        const countB = bookmarks.filter(bm => bm.tags.includes(b)).length;
        return countB - countA; // Sort by frequency, descending
      })
      .filter(tag => !selectedTags.includes(tag))
      .slice(0, 15); // Get top 15
  }, [bookmarks, selectedTags]);

  // Handle adding a new tag
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    addTag(newTagName, selectedCategoryId);
    setNewTagName("");
    toast({
      title: `Tag '${newTagName}' created`
    });
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    addCategory(newCategoryName, newCategoryColor);
    setNewCategoryName("");
    toast({
      title: `Category '${newCategoryName}' created`
    });
  };

  // Group tags by category for the categories view
  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, { categoryName: string, color: string, tags: string[] }> = {};
    
    // Initialize with categories
    categories.forEach(category => {
      grouped[category.id] = { 
        categoryName: category.name, 
        color: category.color,
        tags: []
      };
    });

    // Add uncategorized group
    grouped['uncategorized'] = { 
      categoryName: 'Uncategorized', 
      color: '#9F9EA1', // Medium gray
      tags: []
    };
    
    // Assign tags to categories
    tags.forEach(tag => {
      const categoryId = tag.categoryId || 'uncategorized';
      if (grouped[categoryId]) {
        grouped[categoryId].tags.push(tag.name);
      } else {
        grouped['uncategorized'].tags.push(tag.name);
      }
    });
    
    // Add any tags that exist only by name to uncategorized
    allTagNames.forEach(tagName => {
      const exists = tags.some(t => t.name === tagName);
      if (!exists) {
        grouped['uncategorized'].tags.push(tagName);
      }
    });
    
    return Object.values(grouped);
  }, [tags, categories, allTagNames]);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="all">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="all" className="flex-1">All Tags</TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
          <TabsTrigger value="manage" className="flex-1">Manage</TabsTrigger>
        </TabsList>

        {/* All Tags View */}
        <TabsContent value="all" className="mt-0">
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
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-bookmark-blue text-white px-3 cursor-pointer hover:bg-bookmark-darkBlue"
                  onClick={() => onTagDeselect(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
          
          {/* Popular tags section */}
          {popularTags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-gray-600">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="bg-gray-50 border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue hover:text-bookmark-darkBlue"
                    onClick={() => onTagSelect(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Available tags */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {filteredTags
              .filter((tag) => !selectedTags.includes(tag) && !popularTags.includes(tag))
              .map((tag) => {
                // Find the tag object to get its category and color
                const tagObj = tags.find(t => t.name === tag);
                const categoryId = tagObj?.categoryId;
                const category = categories.find(c => c.id === categoryId);
                const tagColor = tagObj?.color || category?.color;
                
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer border-bookmark-blue hover:bg-bookmark-softBlue",
                      tagColor ? "border-opacity-50" : ""
                    )}
                    onClick={() => onTagSelect(tag)}
                    style={tagColor ? { borderColor: tagColor } : undefined}
                  >
                    {tag}
                  </Badge>
                );
              })}
          </div>
        </TabsContent>

        {/* Categories View */}
        <TabsContent value="categories" className="mt-0">
          <div className="space-y-4">
            {tagsByCategory.map((category, index) => (
              category.tags.length > 0 && (
                <div key={index} className="space-y-2">
                  <h3 
                    className="text-sm font-medium flex items-center"
                    style={{ color: category.color }}
                  >
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.categoryName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.tags
                      .filter(tagName => !searchQuery || tagName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((tagName) => (
                        <Badge
                          key={tagName}
                          variant={selectedTags.includes(tagName) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer",
                            selectedTags.includes(tagName) 
                              ? "bg-bookmark-blue text-white hover:bg-bookmark-darkBlue" 
                              : "hover:bg-bookmark-softBlue"
                          )}
                          style={selectedTags.includes(tagName) ? undefined : { borderColor: category.color }}
                          onClick={() => selectedTags.includes(tagName) 
                            ? onTagDeselect(tagName) 
                            : onTagSelect(tagName)
                          }
                        >
                          {tagName}
                          {selectedTags.includes(tagName) && " ×"}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>

        {/* Manage Tags View */}
        <TabsContent value="manage" className="mt-0">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Add New Tag</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                />
                <Select 
                  value={selectedCategoryId || ''} 
                  onValueChange={(value) => setSelectedCategoryId(value === '' ? undefined : value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddTag}
                  className="bg-bookmark-blue hover:bg-bookmark-darkBlue"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Add New Category</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Input 
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                </div>
                <Button 
                  onClick={handleAddCategory}
                  className="bg-bookmark-purple hover:bg-bookmark-darkPurple"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Manage Categories</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded border"
                    style={{ borderColor: category.color }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input defaultValue={category.name} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center space-x-2">
                              <Input 
                                type="color"
                                defaultValue={category.color}
                                className="w-20"
                              />
                              <div 
                                className="w-8 h-8 rounded-md border"
                                style={{ backgroundColor: category.color }}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTagSelector;
