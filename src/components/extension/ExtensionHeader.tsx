
import { BookmarkPlus } from 'lucide-react';

const ExtensionHeader = () => {
  return (
    <div className="flex items-center mb-4">
      <div className="bg-bookmark-purple p-2 rounded-md mr-2">
        <BookmarkPlus className="h-5 w-5 text-white" />
      </div>
      <h2 className="text-lg font-bold">Visual Bookmarker</h2>
    </div>
  );
};

export default ExtensionHeader;
