
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const BookmarkletInstall = () => {
  const { toast } = useToast();
  
  const getBookmarkletCode = () => {
    const origin = window.location.origin;
    return `javascript:(function(){
      try {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const popup = window.open('${origin}/extension?url='+url+'&title='+title,'TagMarked','width=400,height=500,resizable=yes,scrollbars=yes');
        if(!popup || popup.closed || typeof popup.closed=='undefined') {
          alert('Please allow popups for TagMarked to work properly.');
        }
      } catch(e) {
        alert('TagMarked bookmarklet error: ' + e.message);
      }
    })();`;
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getBookmarkletCode());
    toast({
      title: "Copied to clipboard",
      description: "Bookmarklet code copied successfully",
    });
  };
  
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Install the TagMarked Bookmarklet</h3>
        <p className="text-sm text-gray-500">
          Drag this button to your bookmarks bar to quickly save pages to TagMarked
        </p>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center py-2">
          <a 
            href={getBookmarkletCode()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md no-underline font-medium inline-flex items-center shadow-md hover:bg-blue-700 transition-colors"
            onClick={(e) => {
              // This prevents the link from navigating when clicked normally
              // Users should drag it to the bookmarks bar instead
              e.preventDefault();
              toast({
                title: "Drag to your bookmarks bar",
                description: "Don't click the button - drag it to your bookmarks bar instead",
              });
            }}
            draggable="true"
            onDragEnd={() => {
              toast({
                title: "Bookmarklet ready!",
                description: "Now you can use it on any page to save bookmarks",
              });
            }}
          >
            📚 Save to TagMarked
          </a>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Alternative: Copy the Code</h4>
          <p className="text-sm text-gray-500 mb-2">
            If dragging doesn't work, copy this code and create a new bookmark manually:
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={getBookmarkletCode()}
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button onClick={handleCopyToClipboard}>
              Copy
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Troubleshooting</h4>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>Make sure your bookmarks bar is visible (View → Show Bookmarks Bar)</li>
            <li>If clicking the bookmarklet doesn't work, check if your browser is blocking popups</li>
            <li>Some websites might prevent bookmarklets from running due to security policies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookmarkletInstall;
