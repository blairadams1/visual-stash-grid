
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkPlus, Check, Tag } from 'lucide-react';
import { getCurrentTab, sendMessage } from '@/lib/extensionApi';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Bookmark } from '@/lib/bookmarkUtils';
import { Badge } from '@/components/ui/badge';
import { generateAutoTags } from '@/lib/bookmarkUtils';

const ExtensionPopup = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Get bookmarks to extract popular tags
  const [bookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
  // Auto-suggested tags
  const [autoTags, setAutoTags] = useState<string[]>([]);
  
  // Calculate popular tags
  const popularTags = Array.from(
    new Set(bookmarks.flatMap((bookmark) => bookmark.tags))
  )
    .sort((a, b) => {
      // Count occurrences of each tag
      const countA = bookmarks.filter(bm => bm.tags.includes(a)).length;
      const countB = bookmarks.filter(bm => bm.tags.includes(b)).length;
      return countB - countA; // Sort by frequency, descending
    })
    .slice(0, 15); // Get top 15

  // Get URL and title from query parameters or current tab
  useEffect(() => {
    const loadCurrentPage = async () => {
      // Check for URL parameters first (used when opened via bookmarklet)
      const urlParams = new URLSearchParams(window.location.search);
      const urlFromParams = urlParams.get('url');
      const titleFromParams = urlParams.get('title');
      
      if (urlFromParams) {
        setUrl(urlFromParams);
        if (titleFromParams) setTitle(titleFromParams);
        
        // Generate auto tags based on URL and title
        const autoTagsData = generateAutoTags(urlFromParams, titleFromParams || '', 3);
        setAutoTags(autoTagsData.tags);
        
        return;
      }
      
      // Fall back to getting current tab info
      const tab = await getCurrentTab();
      if (tab) {
        setUrl(tab.url);
        setTitle(tab.title);
        
        // Generate auto tags based on URL and title
        const autoTagsData = generateAutoTags(tab.url, tab.title, 3);
        setAutoTags(autoTagsData.tags);
      }
    };
    
    loadCurrentPage();
  }, []);

  // Update tags input when auto tags change
  useEffect(() => {
    if (autoTags.length > 0) {
      setTags(autoTags.join(', '));
    }
  }, [autoTags]);

  const handleAddBookmark = async () => {
    if (!url) {
      toast({
        title: 'URL is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Process tags
      const tagsList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Add bookmark via extension API
      const response = await sendMessage({
        type: 'ADD_BOOKMARK',
        bookmark: {
          url,
          title,
          tags: tagsList
        }
      });

      if (response.success) {
        setIsSuccess(true);
        toast({
          title: 'Page bookmarked!',
          description: 'The page has been added to your bookmarks.',
        });
        
        // Clear the form if not using current page
        if (!window.location.href.includes('/extension')) {
          setTags('');
        }

        // Reset success state and close window after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
          if (window !== window.parent) {
            window.parent.postMessage({ type: 'CLOSE_POPUP' }, '*');
          } else {
            window.close();
          }
        }, 2000);
      } else {
        toast({
          title: 'Failed to bookmark page',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error bookmarking page:', error);
      toast({
        title: 'Error bookmarking page',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a tag to the current tags list
  const addTag = (tag: string) => {
    const currentTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      setTags(newTags.join(', '));
    }
  };

  // Remove a tag from the current tags list
  const removeTag = (tagToRemove: string) => {
    const currentTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0 && t !== tagToRemove);
    
    setTags(currentTags.join(', '));
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-bookmark-purple p-2 rounded-md mr-2">
          <BookmarkPlus className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-bold">Visual Bookmarker</h2>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Page Title</label>
          <Input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Page Title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <Input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
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
              {tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).map(tag => (
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
          <div>
            <label className="block text-sm font-medium mb-1">Popular Tags</label>
            <div className="flex flex-wrap gap-1">
              {popularTags.slice(0, 15).map(tag => {
                const isSelected = tags.split(',').map(t => t.trim()).includes(tag);
                return (
                  <Badge 
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${
                      isSelected 
                        ? "bg-bookmark-blue text-white" 
                        : "border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue"
                    }`}
                    onClick={() => isSelected ? removeTag(tag) : addTag(tag)}
                  >
                    {tag} {isSelected && "×"}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleAddBookmark}
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
        
        <div className="mt-2 text-xs text-center text-gray-500">
          <a 
            href="/" 
            target="_blank" 
            className="underline hover:text-bookmark-purple"
            onClick={() => {
              if (window !== window.parent) {
                // If in an iframe, navigate the parent window
                window.parent.location.href = '/';
                return false;
              }
              return true;
            }}
          >
            Open Bookmarks Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPopup;
