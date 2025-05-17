
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import TagSelector from "@/components/TagSelector";
import { Bookmark } from "@/lib/bookmarkUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import BookmarkletInstall from "@/components/BookmarkletInstall";
import BookmarkFloatingButton from "@/components/BookmarkFloatingButton";
import { Filter, Plus, RefreshCw } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Index = () => {
  // State for bookmarks from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { toast } = useToast();

  // Force refresh bookmarks from local storage
  useEffect(() => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  // Function to refresh bookmarks from localStorage
  const refreshBookmarks = () => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
      toast({
        title: "Bookmarks refreshed",
      });
    }
  };

  // Calculate available tags from all bookmarks
  const availableTags = Array.from(
    new Set(bookmarks.flatMap((bookmark) => bookmark.tags))
  ).sort();

  // Handle adding a new bookmark
  const handleAddBookmark = (bookmark: Bookmark) => {
    setBookmarks([...bookmarks, bookmark]);
  };

  // Handle deleting a bookmark
  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    toast({
      title: "Bookmark deleted",
    });
  };

  // Handle reordering of bookmarks
  const handleBookmarksReordered = (reorderedBookmarks: Bookmark[]) => {
    setBookmarks(reorderedBookmarks);
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
  };

  // Handle tag deselection
  const handleTagDeselect = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Handle clearing all tags
  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // Filter bookmarks based on search query and selected tags
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    // Filter by search query
    const matchesQuery =
      searchQuery === "" ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => bookmark.tags.includes(tag));

    return matchesQuery && matchesTags;
  });

  // Sort bookmarks by order
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-bookmark-darkBlue">TagMarked</h1>
              <p className="text-gray-500">Save and organize your bookmarks visually</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowForm(!showForm)}
                className={cn(
                  "transition-colors",
                  showForm 
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                    : "bg-bookmark-blue hover:bg-bookmark-darkBlue"
                )}
              >
                <Plus className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                onClick={refreshBookmarks}
                title="Refresh Bookmarks"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant={selectedTags.length > 0 ? "default" : "outline"}
                    className={selectedTags.length > 0 ? "bg-bookmark-blue" : ""}
                  >
                    <Filter className="h-5 w-5" />
                    {selectedTags.length > 0 && (
                      <span className="ml-1 text-xs bg-white text-bookmark-darkBlue rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedTags.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4">
                    <TagSelector
                      availableTags={availableTags}
                      selectedTags={selectedTags}
                      onTagSelect={handleTagSelect}
                      onTagDeselect={handleTagDeselect}
                      onClearAllTags={handleClearAllTags}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <BookmarkletInstall />
              
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-8"
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Bookmark Form */}
        {showForm && (
          <>
            <div className="px-4">
              <BookmarkForm
                onAddBookmark={handleAddBookmark}
                existingBookmarks={bookmarks}
              />
              <Separator className="my-6" />
            </div>
          </>
        )}

        {/* Bookmark Grid */}
        <div className="w-full">
          {sortedBookmarks.length > 0 ? (
            <BookmarkGrid
              bookmarks={sortedBookmarks}
              onBookmarksReordered={handleBookmarksReordered}
              onTagClick={handleTagSelect}
              onDeleteBookmark={handleDeleteBookmark}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center mx-4">
              <h2 className="text-xl font-medium mb-2">No bookmarks found</h2>
              <p className="text-gray-500 mb-4">
                {bookmarks.length === 0
                  ? "Add your first bookmark to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {bookmarks.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-bookmark-blue hover:bg-bookmark-darkBlue"
                >
                  Add Bookmark
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Floating button with refreshBookmarks callback */}
      <BookmarkFloatingButton onBookmarkAdded={refreshBookmarks} />
    </div>
  );
};

export default Index;
