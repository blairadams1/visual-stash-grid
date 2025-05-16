
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkPlus } from 'lucide-react';
import { getCurrentTab, sendMessage } from '@/lib/extensionApi';
import { useToast } from '@/components/ui/use-toast';

const ExtensionPopup = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Simulate getting current page when popup opens
  useEffect(() => {
    const loadCurrentPage = async () => {
      const tab = await getCurrentTab();
      if (tab) {
        setUrl(tab.url);
        setTitle(tab.title);
      }
    };
    
    loadCurrentPage();
  }, []);

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

        // Reset success state after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
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

  // Quick save functionality similar to what was in BookmarkFloatingButton
  const handleQuickSave = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const tab = await getCurrentTab();
      
      if (tab) {
        const response = await sendMessage({
          type: 'ADD_BOOKMARK',
          bookmark: {
            url: tab.url,
            title: tab.title,
            tags: []
          }
        });
        
        if (response.success) {
          setIsSuccess(true);
          toast({
            title: 'Bookmark saved!',
            description: 'The page has been added to your bookmarks.',
          });
          
          // Reset success state after 2 seconds
          setTimeout(() => {
            setIsSuccess(false);
          }, 2000);
        } else {
          toast({
            title: 'Failed to save bookmark',
            description: response.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: 'Error saving bookmark',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <Input 
            type="text" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
            placeholder="design, inspiration, reference"
          />
        </div>
        
        <Button 
          onClick={handleAddBookmark}
          disabled={isLoading}
          className={`w-full ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-bookmark-purple hover:bg-bookmark-darkPurple'}`}
        >
          {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Add Bookmark'}
        </Button>

        {/* Quick Save Button - similar to the one that was in BookmarkFloatingButton */}
        <Button
          onClick={handleQuickSave}
          disabled={isLoading}
          className={`w-full ${
            isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-bookmark-purple hover:bg-bookmark-darkPurple'
          }`}
          title="Save to Hub"
        >
          <BookmarkPlus className="h-5 w-5 mr-1" />
          {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Save to Hub'}
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
