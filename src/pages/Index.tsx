
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import EnhancedTagSelector from "@/components/EnhancedTagSelector";
import { Bookmark } from "@/lib/bookmarkUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Filter, Plus, RefreshCw } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SettingsDropdown from "@/components/SettingsDropdown";

const Index = () => {
  // State for bookmarks from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Presentation settings
  const [layout, setLayout] = useLocalStorage<'grid' | 'list' | 'compact'>('layout', 'grid');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [cardSize, setCardSize] = useLocalStorage<'small' | 'medium' | 'large'>('cardSize', 'medium');
  
  const { toast } = useToast();
  
  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  // Handle updating a bookmark
  const handleUpdateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(
      bookmarks.map(bookmark => 
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
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

  // Get card height based on card size setting
  const getCardHeight = () => {
    switch (cardSize) {
      case 'small':
        return 'h-40';
      case 'large':
        return 'h-64';
      default:
        return 'h-52'; // medium size
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="container max-w-full px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/9350c0ba-fcd2-477d-b549-a53925a712bd.png" 
                alt="TagMarked Logo" 
                className="h-8 w-8 mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-bookmark-blue">
                  TagMarked
                </h1>
                <p className="text-xs text-gray-500">Your visual bookmark manager</p>
              </div>
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
                    <EnhancedTagSelector
                      selectedTags={selectedTags}
                      onTagSelect={handleTagSelect}
                      onTagDeselect={handleTagDeselect}
                      onClearAllTags={handleClearAllTags}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <SettingsDropdown 
                bookmarks={bookmarks} 
                onChangeLayout={setLayout}
                onChangeTheme={setTheme}
                onChangeCardSize={setCardSize}
                currentLayout={layout}
                currentTheme={theme}
                currentCardSize={cardSize}
              />
              
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pr-8 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
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

      <main className="container max-w-full py-8">
        {/* Bookmark Form */}
        {showForm && (
          <>
            <div className="px-2">
              <BookmarkForm
                onAddBookmark={handleAddBookmark}
                existingBookmarks={bookmarks}
              />
              <Separator className="my-6" />
            </div>
          </>
        )}

        {/* Bookmark Grid */}
        <div className="w-full px-2">
          {sortedBookmarks.length > 0 ? (
            <BookmarkGrid
              bookmarks={sortedBookmarks}
              onBookmarksReordered={handleBookmarksReordered}
              onTagClick={handleTagSelect}
              onDeleteBookmark={handleDeleteBookmark}
              onUpdateBookmark={handleUpdateBookmark}
              layout={layout}
              cardSize={getCardHeight()}
            />
          ) : (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow text-center mx-2`}>
              <h2 className="text-xl font-medium mb-2">No bookmarks found</h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
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
    </div>
  );
};

export default Index;
