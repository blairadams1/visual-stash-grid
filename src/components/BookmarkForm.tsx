
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, createBookmark } from "@/lib/bookmarkUtils";
import { useToast } from "@/components/ui/use-toast";

interface BookmarkFormProps {
  onAddBookmark: (bookmark: Bookmark) => void;
  existingBookmarks: Bookmark[];
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onAddBookmark, existingBookmarks }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [customTags, setCustomTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const newBookmark = createBookmark(
        processedUrl,
        finalTitle,
        tagArray,
        existingBookmarks
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-4">
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
