
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkPlus, Check } from 'lucide-react';
import { generateAutoTags } from '@/lib/bookmarkUtils';
import TagList from './TagList';

interface BookmarkFormProps {
  url: string;
  title: string;
  onSave: (url: string, title: string, tags: string[]) => Promise<boolean>;
  popularTags: string[];
  isLoading: boolean;
  isSuccess: boolean;
  initialTags?: string[];
}

const BookmarkForm = ({ 
  url, 
  title, 
  onSave, 
  popularTags, 
  isLoading, 
  isSuccess,
  initialTags = [] 
}: BookmarkFormProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [tags, setTags] = useState('');
  const [autoTags, setAutoTags] = useState<string[]>(initialTags);

  // Generate auto tags based on URL and title
  useEffect(() => {
    if (currentUrl) {
      const generatedTags = generateAutoTags(currentUrl, currentTitle || '', 3);
      setAutoTags(generatedTags.tags);
    }
  }, [currentUrl, currentTitle]);

  // Update tags input when auto tags change
  useEffect(() => {
    if (autoTags.length > 0) {
      setTags(autoTags.join(', '));
    }
  }, [autoTags]);

  // Get tag list as array
  const getTagsArray = () => {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // Add a tag to the current tags list
  const addTag = (tag: string) => {
    const currentTags = getTagsArray();
    
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      setTags(newTags.join(', '));
    }
  };

  // Remove a tag from the current tags list
  const removeTag = (tagToRemove: string) => {
    const currentTags = getTagsArray()
      .filter(t => t !== tagToRemove);
    
    setTags(currentTags.join(', '));
  };

  // Handle tag click (toggle add/remove)
  const handleTagClick = (tag: string) => {
    const currentTags = getTagsArray();
    if (currentTags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  const handleSubmit = async () => {
    if (!currentUrl) return false;
    const tagsList = getTagsArray();
    return await onSave(currentUrl, currentTitle, tagsList);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Page Title</label>
        <Input 
          type="text" 
          value={currentTitle} 
          onChange={(e) => setCurrentTitle(e.target.value)} 
          placeholder="Page Title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">URL</label>
        <Input 
          type="text" 
          value={currentUrl} 
          onChange={(e) => setCurrentUrl(e.target.value)} 
          placeholder="https://"
        />
      </div>
      
      <div>
        <label className="flex items-center justify-between text-sm font-medium mb-1">
          <span>Tags</span>
          {autoTags.length > 0 && (
            <span className="text-xs text-gray-500">Auto-tagged</span>
          )}
        </label>
        <Input 
          type="text" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="design, inspiration, reference"
        />
        
        {/* Display current tags */}
        {tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {getTagsArray().map(tag => (
              <Badge 
                key={tag} 
                className="bg-bookmark-blue text-white"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags Section */}
      {popularTags.length > 0 && (
        <TagList 
          tags={popularTags}
          currentTags={getTagsArray()}
          onTagClick={handleTagClick}
        />
      )}
      
      <Button 
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-bookmark-purple hover:bg-bookmark-darkPurple'}`}
      >
        {isLoading ? 'Saving...' : isSuccess ? (
          <span className="flex items-center">
            <Check className="h-5 w-5 mr-1" />
            Saved!
          </span>
        ) : (
          <span className="flex items-center">
            <BookmarkPlus className="h-5 w-5 mr-1" />
            Add Bookmark
          </span>
        )}
      </Button>
    </div>
  );
};

export default BookmarkForm;
