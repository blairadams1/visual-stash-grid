
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const BookmarkletInstall = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  
  // Create bookmarklet code with improved behavior - pass more data to better identify page
  const bookmarkletCode = `javascript:(function(){
    // Get meta description for better page context
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    
    // Get h1 text which often contains the main page title
    const h1Text = document.querySelector('h1')?.textContent || '';
    
    // Get main content text for context
    const mainText = document.querySelector('main')?.textContent?.substring(0, 500) || 
                    document.body.textContent?.substring(0, 500) || '';
                    
    const popup = window.open('${window.location.origin}/extension?url='+
      encodeURIComponent(window.location.href)+
      '&title='+encodeURIComponent(document.title)+
      '&h1='+encodeURIComponent(h1Text)+
      '&desc='+encodeURIComponent(metaDesc)+
      '&content='+encodeURIComponent(mainText),
      'TagMarked','width=400,height=500,resizable=yes');
    if(!popup) alert('Please allow popups for TagMarked to work properly.');
  })();`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    toast({
      title: "Copied to clipboard",
      description: "Bookmarklet code copied successfully",
    });
  };

  return (
    <>
      <div 
        onClick={() => setShowDialog(true)} 
        className="w-full cursor-pointer"
      >
        Install TagMarked
      </div>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install TagMarked</DialogTitle>
            <DialogDescription>
              Add TagMarked to your browser for quick bookmarking
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Option 1: Drag to bookmarks bar</h3>
            <p className="text-sm text-gray-500 mb-3">
              Drag the button below to your bookmarks bar to install the bookmarklet.
            </p>
            <div className="flex justify-center mb-6">
              <a 
                href={bookmarkletCode}
                className="px-4 py-2 bg-bookmark-blue text-white rounded-md no-underline font-medium"
                onClick={(e) => e.preventDefault()}
                draggable="true"
              >
                📚 TagMarked
              </a>
            </div>
            
            <h3 className="font-medium mb-2">Option 2: Copy the link</h3>
            <p className="text-sm text-gray-500 mb-3">
              Copy this link and create a new bookmark manually.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={bookmarkletCode}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              />
              <Button
                className="shrink-0"
                onClick={handleCopyCode}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookmarkletInstall;
