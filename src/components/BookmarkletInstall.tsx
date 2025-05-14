
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

const BookmarkletInstall = () => {
  const [showDialog, setShowDialog] = useState(false);
  
  // Create bookmarklet code (this would be much more complex in a real extension)
  const bookmarkletCode = `javascript:(function(){
    window.open('${window.location.origin}/extension?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title),'_blank','width=400,height=500');
  })();`;

  return (
    <>
      <Button 
        variant="outline" 
        className="bg-bookmark-softPurple border-bookmark-purple text-bookmark-darkPurple hover:bg-bookmark-purple hover:text-white"
        onClick={() => setShowDialog(true)}
      >
        Install Extension
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Visual Bookmarker</DialogTitle>
            <DialogDescription>
              Add Visual Bookmarker to your browser for quick bookmarking
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
                className="px-4 py-2 bg-bookmark-purple text-white rounded-md no-underline font-medium"
                onClick={(e) => e.preventDefault()}
                draggable="true"
              >
                📚 Visual Bookmarker
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
                onClick={() => {
                  navigator.clipboard.writeText(bookmarkletCode);
                  alert("Copied bookmarklet code!");
                }}
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
