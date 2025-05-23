import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, createBookmark, Collection } from "@/lib/bookmarkUtils";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollections } from "@/hooks/useCollections";

interface BookmarkFormProps {
  onAddBookmark: (bookmark: Bookmark) => void;
  existingBookmarks: Bookmark[];
  selectedCollectionId?: string | null;
  initialUrl?: string;
  initialTitle?: string;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ 
  onAddBookmark, 
  existingBookmarks, 
  selectedCollectionId = null,
  initialUrl = "",
  initialTitle = "",
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [customTags, setCustomTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  
  const { collections } = useCollections();
  const { toast } = useToast();

  // Set the selected collection when it changes externally
  useEffect(() => {
    setCollectionId(selectedCollectionId);
  }, [selectedCollectionId]);

  // Update form when initial values change
  useEffect(() => {
    setUrl(initialUrl);
    setTitle(initialTitle);
  }, [initialUrl, initialTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!url) {
      toast({
        title: "URL is required",
        variant: "destructive",
      });
      return;
    }

    // Add protocol if missing
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = "https://" + processedUrl;
    }

    setIsLoading(true);

    try {
      // Try to get the title if not provided
      let finalTitle = title;
      if (!finalTitle) {
        // Default to domain name if title isn't provided
        const urlObj = new URL(processedUrl);
        finalTitle = urlObj.hostname.replace('www.', '');
      }

      // Process custom tags
      const tagArray = customTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Create bookmark
      const newBookmark = await createBookmark(
        processedUrl,
        finalTitle,
        tagArray,
        existingBookmarks,
        collectionId || undefined
      );

      // Add the bookmark
      onAddBookmark(newBookmark);

      // Reset form
      setUrl("");
      setTitle("");
      setCustomTags("");
      
      toast({
        title: "Bookmark added successfully!",
      });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast({
        title: "Error adding bookmark",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get all collections as a flat list for the dropdown
  const getFlatCollections = (collections: Collection[]): { id: string, name: string, level: number }[] => {
    const result: { id: string, name: string, level: number }[] = [];
    
    const addCollection = (collection: Collection, level: number) => {
      result.push({ id: collection.id, name: collection.name, level });
      
      const children = collections.filter(c => c.parentId === collection.id);
      children.forEach(child => addCollection(child, level + 1));
    };
    
    // Get root collections (those with no parent)
    const rootCollections = collections.filter(c => !c.parentId);
    rootCollections.forEach(root => addCollection(root, 0));
    
    return result;
  };

  const flatCollections = getFlatCollections(collections);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="URL (required)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Tags (comma separated)"
            value={customTags}
            onChange={(e) => setCustomTags(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={collectionId || 'none'}
            onValueChange={(value) => setCollectionId(value === 'none' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Collection</SelectItem>
              {flatCollections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {Array(collection.level).fill('—').join('')} {collection.level > 0 && '› '}{collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-bookmark-purple hover:bg-bookmark-darkPurple"
        >
          {isLoading ? "Adding..." : "Add Bookmark"}
        </Button>
      </div>
    </form>
  );
};

export default BookmarkForm;
