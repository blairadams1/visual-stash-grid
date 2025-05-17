
import { useState } from 'react';
import { BookmarkPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentTab, sendMessage } from '@/lib/extensionApi';
import { useToast } from '@/components/ui/use-toast';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAutoTags } from '@/lib/bookmarkUtils';

interface BookmarkFloatingButtonProps {
  onBookmarkAdded?: () => void;
}

const BookmarkFloatingButton = ({ onBookmarkAdded }: BookmarkFloatingButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleQuickSave = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const tab = await getCurrentTab();
      
      if (tab) {
        // Generate the 3 most logical tags automatically
        const autoTags = generateAutoTags(tab.url, tab.title, 3);
        
        const response = await sendMessage({
          type: 'ADD_BOOKMARK',
          bookmark: {
            url: tab.url,
            title: tab.title,
            tags: autoTags
          }
        });
        
        if (response.success) {
          setIsSuccess(true);
          
          // Show the tags that were automatically added
          toast({
            title: 'Bookmark saved!',
            description: autoTags.length > 0 
              ? `Tagged with: ${autoTags.join(', ')}`
              : 'The page has been added to your bookmarks.',
          });
          
          // Call the callback function to refresh bookmarks
          if (onBookmarkAdded) {
            onBookmarkAdded();
          }
          
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleQuickSave}
              disabled={isLoading}
              size="lg"
              className={`shadow-lg ${
                isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-bookmark-blue hover:bg-bookmark-darkBlue'
              }`}
            >
              {isLoading ? (
                'Saving...'
              ) : isSuccess ? (
                <span className="flex items-center">
                  <Check className="h-5 w-5 mr-1" />
                  Saved!
                </span>
              ) : (
                <span className="flex items-center">
                  <BookmarkPlus className="h-5 w-5 mr-1" />
                  Save to Hub
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save the current page to your TagMarked</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default BookmarkFloatingButton;
