
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import TagList from '@/components/extension/TagList';
import { generateAutoTags } from '@/lib/bookmarkUtils';

interface PageContext {
  h1: string;
  description: string;
  content: string;
}

interface BookmarkFormProps {
  url: string;
  title: string;
  onSave: (url: string, title: string, tags: string[]) => Promise<boolean>;
  popularTags: string[];
  isLoading: boolean;
  isSuccess: boolean;
  pageContext?: PageContext;
}

const BookmarkForm = ({ 
  url, 
  title, 
  onSave, 
  popularTags, 
  isLoading, 
  isSuccess,
  pageContext = { h1: '', description: '', content: '' }
}: BookmarkFormProps) => {
  const [bookmarkUrl, setBookmarkUrl] = useState(url);
  const [bookmarkTitle, setBookmarkTitle] = useState(title);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Auto-generate tags when URL/title changes, using enhanced context if available
  useEffect(() => {
    if (url) {
      // Create combined content for better tag generation
      const enhancedContent = [
        title,
        pageContext.h1, 
        pageContext.description,
        pageContext.content.substring(0, 200) // Limit content length
      ].filter(Boolean).join(' ');
      
      const { tags: autoTags } = generateAutoTags(url, enhancedContent, 4);
      setTags(autoTags);
    }
  }, [url, title, pageContext]);

  // Update form fields when props change
  useEffect(() => {
    setBookmarkUrl(url);
    setBookmarkTitle(title);
  }, [url, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(bookmarkUrl, bookmarkTitle, tags);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleTagClick = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Page title"
          value={bookmarkTitle}
          onChange={(e) => setBookmarkTitle(e.target.value)}
          required
          className="bg-white border-gray-200 focus:border-bookmark-blue focus:ring-bookmark-blue/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          placeholder="https://example.com"
          value={bookmarkUrl}
          onChange={(e) => setBookmarkUrl(e.target.value)}
          required
          className="bg-white border-gray-200 focus:border-bookmark-blue focus:ring-bookmark-blue/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(tag => (
            <Button 
              key={tag} 
              type="button"
              variant="outline"
              size="sm"
              className="bg-bookmark-blue/10 hover:bg-bookmark-blue/20 text-bookmark-blue border-none"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag} <span className="ml-1">×</span>
            </Button>
          ))}
        </div>
        
        <Input
          id="tags"
          placeholder="Add tags (press Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="bg-white border-gray-200 focus:border-bookmark-blue focus:ring-bookmark-blue/20"
        />
      </div>
      
      {/* Show popular tags */}
      {popularTags.length > 0 && (
        <TagList 
          tags={popularTags} 
          currentTags={tags} 
          onTagClick={handleTagClick}
        />
      )}
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-bookmark-blue hover:bg-bookmark-darkBlue transition-colors"
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> 
              Saved!
            </span>
          ) : (
            'Save Bookmark'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookmarkForm;
