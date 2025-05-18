
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
import { Filter, Plus, RefreshCw, FolderOpen, Settings } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CollectionsPanel from "@/components/CollectionsPanel";
import { useCollections } from "@/hooks/useCollections";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SettingsDropdown from "@/components/SettingsDropdown";
import { Link } from "react-router-dom";

const Index = () => {
  // State for bookmarks from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { collections } = useCollections();
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

  // Handle collection selection
  const handleSelectCollection = (collectionId: string | null) => {
    setSelectedCollectionId(collectionId);
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

  // Get selected collection name if any
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container max-w-full px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-bookmark-darkBlue mb-2">
                TagMarked
                {selectedCollection && (
                  <span className="ml-2 text-gray-500">
                    / {selectedCollection.name}
                  </span>
                )}
              </h1>
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

              <Button
                variant="outline"
                asChild
              >
                <Link to="/manage">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    aria-label="Open collections"
                  >
                    <FolderOpen className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Collections</SheetTitle>
                    <SheetDescription>
                      Organize your bookmarks into collections
                    </SheetDescription>
                  </SheetHeader>
                  <CollectionsPanel 
                    selectedCollectionId={selectedCollectionId}
                    onSelectCollection={handleSelectCollection}
                  />
                </SheetContent>
              </Sheet>

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
              
              <SettingsDropdown bookmarks={bookmarks} />
              
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

      <main className="container max-w-full py-8">
        {/* Bookmark Form */}
        {showForm && (
          <>
            <div className="px-2">
              <BookmarkForm
                onAddBookmark={handleAddBookmark}
                existingBookmarks={bookmarks}
                selectedCollectionId={selectedCollectionId}
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
              selectedCollectionId={selectedCollectionId}
              collections={collections}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center mx-2">
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
    </div>
  );
};

export default Index;
