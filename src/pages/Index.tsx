
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

const Index = () => {
  // State for bookmarks from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const { toast } = useToast();

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
              <h1 className="text-2xl font-bold text-bookmark-darkPurple">Visual Bookmarker</h1>
              <p className="text-gray-500">Save and organize your bookmarks visually</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowForm(!showForm)}
                className={cn(
                  "transition-colors",
                  showForm 
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                    : "bg-bookmark-purple hover:bg-bookmark-darkPurple"
                )}
              >
                {showForm ? "Hide Form" : "Add Bookmark"}
              </Button>
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

      <main className="container mx-auto px-4 py-8">
        {/* Bookmark Form */}
        {showForm && (
          <>
            <BookmarkForm
              onAddBookmark={handleAddBookmark}
              existingBookmarks={bookmarks}
            />
            <Separator className="my-6" />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar with Tag Filter */}
          <aside className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow">
              <TagSelector
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onTagDeselect={handleTagDeselect}
                onClearAllTags={handleClearAllTags}
              />
            </div>
          </aside>

          {/* Main Content with Bookmark Grid */}
          <div className="md:col-span-3">
            {sortedBookmarks.length > 0 ? (
              <BookmarkGrid
                bookmarks={sortedBookmarks}
                onBookmarksReordered={handleBookmarksReordered}
                onTagClick={handleTagSelect}
                onDeleteBookmark={handleDeleteBookmark}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <h2 className="text-xl font-medium mb-2">No bookmarks found</h2>
                <p className="text-gray-500 mb-4">
                  {bookmarks.length === 0
                    ? "Add your first bookmark to get started."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {bookmarks.length === 0 && (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-bookmark-purple hover:bg-bookmark-darkPurple"
                  >
                    Add Bookmark
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
