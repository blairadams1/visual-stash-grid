
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentTab, sendMessage } from '@/lib/extensionApi';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Bookmark } from '@/lib/bookmarkUtils';
import ExtensionHeader from './extension/ExtensionHeader';
import BookmarkForm from './extension/BookmarkForm';
import DashboardLink from './extension/DashboardLink';

const ExtensionPopup = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Get bookmarks to extract popular tags
  const [bookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
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
        return;
      }
      
      // Fall back to getting current tab info
      const tab = await getCurrentTab();
      if (tab) {
        setUrl(tab.url);
        setTitle(tab.title);
      }
    };
    
    loadCurrentPage();
  }, []);

  const handleAddBookmark = async (url: string, title: string, tagsList: string[]) => {
    if (!url) {
      toast({
        title: 'URL is required',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
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

        // Reset success state and close window after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
          if (window !== window.parent) {
            window.parent.postMessage({ type: 'CLOSE_POPUP' }, '*');
          } else {
            window.close();
          }
        }, 2000);
        
        return true;
      } else {
        toast({
          title: 'Failed to bookmark page',
          description: response.message,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error bookmarking page:', error);
      toast({
        title: 'Error bookmarking page',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <ExtensionHeader />
      
      <BookmarkForm 
        url={url}
        title={title}
        onSave={handleAddBookmark}
        popularTags={popularTags}
        isLoading={isLoading}
        isSuccess={isSuccess}
      />
      
      <DashboardLink />
    </div>
  );
};

export default ExtensionPopup;
