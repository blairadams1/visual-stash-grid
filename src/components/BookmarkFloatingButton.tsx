
import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentTab, sendMessage } from '@/lib/extensionApi';
import { useToast } from '@/components/ui/use-toast';

const BookmarkFloatingButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

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
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleQuickSave}
        disabled={isLoading}
        className={`${
          isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-bookmark-purple hover:bg-bookmark-darkPurple'
        }`}
        title="Save to Hub"
      >
        <BookmarkPlus className="h-5 w-5 mr-1" />
        {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Save to Hub'}
      </Button>
    </div>
  );
};

export default BookmarkFloatingButton;
