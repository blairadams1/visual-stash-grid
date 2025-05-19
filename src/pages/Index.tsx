
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import EnhancedTagSelector from "@/components/EnhancedTagSelector";
import { Bookmark, Folder, createFolder } from "@/lib/bookmarkUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Filter, Plus, RefreshCw, FolderPlus, MoveLeft } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import FolderForm from "@/components/FolderForm";
import SettingsDropdown from "@/components/SettingsDropdown";

const Index = () => {
  // State for bookmarks and folders from local storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  const [folders, setFolders] = useLocalStorage<Folder[]>("folders", []);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  
  // Presentation settings
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

  // Update current folder when ID changes
  useEffect(() => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      setCurrentFolder(folder || null);
    } else {
      setCurrentFolder(null);
    }
  }, [currentFolderId, folders]);

  // Force refresh bookmarks from local storage
  useEffect(() => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
    
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    }
  }, []);

  // Function to refresh bookmarks from localStorage
  const refreshBookmarks = () => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
    
    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    }
    
    toast({
      title: "Content refreshed",
    });
  };

  // Handle adding a new bookmark
  const handleAddBookmark = (bookmark: Bookmark) => {
    // Add current folder ID if we're inside a folder
    if (currentFolderId) {
      bookmark.folderId = currentFolderId;
    }
    setBookmarks([...bookmarks, bookmark]);
  };

  // Handle adding a new folder
  const handleAddFolder = (folderData: Partial<Folder>) => {
    const allItems = [...bookmarks, ...folders];
    const newFolder = createFolder(
      folderData.name || "New Folder", 
      allItems,
      folderData.image,
      folderData.tags
    );
    setFolders([...folders, newFolder]);
    toast({
      title: "Folder created",
    });
    setShowFolderForm(false);
  };

  // Handle deleting a bookmark
  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    toast({
      title: "Bookmark deleted",
    });
  };

  // Handle deleting a folder
  const handleDeleteFolder = (id: string) => {
    // Remove the folder
    setFolders(folders.filter((folder) => folder.id !== id));
    
    // Remove folder ID from bookmarks that were in this folder
    // (This returns them to the main view)
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.folderId === id ? { ...bookmark, folderId: undefined } : bookmark
    ));
    
    toast({
      title: "Folder deleted",
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

  // Handle updating a folder
  const handleUpdateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(
      folders.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
    toast({
      title: "Folder updated",
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

  // Handle opening a folder
  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  // Handle moving a bookmark to a folder
  const handleMoveToFolder = (bookmarkId: string, folderId: string) => {
    setBookmarks(
      bookmarks.map(bookmark =>
        bookmark.id === bookmarkId ? { ...bookmark, folderId } : bookmark
      )
    );
    toast({
      title: "Bookmark moved to folder",
    });
  };

  // Get current site information for quick bookmarking
  const getCurrentPageInfo = () => {
    if (typeof window !== 'undefined') {
      return {
        title: document.title || "TagMarked",
        url: window.location.href || "https://tagmarked.app"
      };
    }
    return {
      title: "TagMarked",
      url: "https://tagmarked.app"
    };
  };

  const currentPage = getCurrentPageInfo();

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
              {currentFolder && (
                <Button 
                  variant="outline"
                  onClick={() => setCurrentFolderId(null)}
                  className="flex items-center gap-1"
                >
                  <MoveLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
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
              
              <Dialog open={showFolderForm} onOpenChange={setShowFolderForm}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => setShowFolderForm(true)}
                    className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800"
                  >
                    <FolderPlus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Folder</DialogTitle>
                  </DialogHeader>
                  <FolderForm onSubmit={handleAddFolder} />
                </DialogContent>
              </Dialog>
              
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
                folders={folders}
                onChangeTheme={setTheme}
                onChangeCardSize={setCardSize}
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

      <main className="container max-w-full py-4">
        {currentFolder && (
          <div className="px-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <img 
                src={currentFolder.image} 
                alt={currentFolder.name}
                className="w-6 h-6"
              />
              {currentFolder.name}
            </h2>
          </div>
        )}
        
        {/* Bookmark Form */}
        {showForm && (
          <div className="px-4 py-4 bg-white dark:bg-gray-800 mb-6 rounded-lg shadow-sm">
            <BookmarkForm
              onAddBookmark={handleAddBookmark}
              existingBookmarks={bookmarks}
              initialTitle={currentPage.title}
              initialUrl={currentPage.url}
            />
          </div>
        )}

        {/* Bookmark Grid */}
        <div className="w-full px-2">
          {bookmarks.length > 0 || folders.length > 0 ? (
            <BookmarkGrid
              bookmarks={bookmarks}
              folders={folders}
              onBookmarksReordered={handleBookmarksReordered}
              onTagClick={handleTagSelect}
              onDeleteBookmark={handleDeleteBookmark}
              onUpdateBookmark={handleUpdateBookmark}
              onDeleteFolder={handleDeleteFolder}
              onUpdateFolder={handleUpdateFolder}
              onOpenFolder={handleOpenFolder}
              onMoveToFolder={handleMoveToFolder}
              cardSize={cardSize}
              currentFolderId={currentFolderId}
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
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-bookmark-blue hover:bg-bookmark-darkBlue"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Bookmark
                  </Button>
                  <Button 
                    onClick={() => setShowFolderForm(true)}
                    className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800"
                  >
                    <FolderPlus className="h-4 w-4 mr-1" />
                    Create Folder
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
