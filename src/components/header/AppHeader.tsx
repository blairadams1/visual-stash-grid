
import { Button } from "@/components/ui/button";
import { Filter, FolderPlus, MoveLeft, Plus, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import EnhancedTagSelector from "@/components/EnhancedTagSelector";
import FolderForm from "@/components/FolderForm";
import SettingsDropdown from "@/components/SettingsDropdown";
import { Folder, Bookmark } from "@/lib/bookmarkUtils";
import { useState } from "react";

interface AppHeaderProps {
  theme: 'light' | 'dark';
  showForm: boolean;
  searchQuery: string;
  currentFolder: Folder | null;
  setShowForm: (show: boolean) => void;
  setShowFolderForm: (show: boolean) => void;
  setCurrentFolderId: (id: string | null) => void;
  showFolderForm: boolean;
  refreshBookmarks: () => void;
  setIsFilterOpen: (open: boolean) => void;
  isFilterOpen: boolean;
  selectedTags: string[];
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
  currentCardSize: 'small' | 'medium' | 'large';
  onToggleSidebar: () => void;
  handleTagSelect: (tag: string) => void;
  handleTagDeselect: (tag: string) => void;
  handleClearAllTags: () => void;
  setSearchQuery: (query: string) => void;
  handleAddFolder: (folderData: Partial<Folder>) => void;
  bookmarks: Bookmark[];
  folders: Folder[];
}

const AppHeader: React.FC<AppHeaderProps> = ({
  theme,
  showForm,
  searchQuery,
  currentFolder,
  setShowForm,
  setShowFolderForm,
  setCurrentFolderId,
  showFolderForm,
  refreshBookmarks,
  setIsFilterOpen,
  isFilterOpen,
  selectedTags,
  onChangeTheme,
  onChangeCardSize,
  currentCardSize,
  onToggleSidebar,
  handleTagSelect,
  handleTagDeselect,
  handleClearAllTags,
  setSearchQuery,
  handleAddFolder,
  bookmarks,
  folders,
}) => {
  return (
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
              onClick={() => {
                setShowForm(!showForm);
              }}
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

            {/* Tag Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
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
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle>Tag Filter</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <EnhancedTagSelector
                    selectedTags={selectedTags}
                    onTagSelect={handleTagSelect}
                    onTagDeselect={handleTagDeselect}
                    onClearAllTags={handleClearAllTags}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <SettingsDropdown 
              bookmarks={bookmarks}
              folders={folders}
              onChangeTheme={onChangeTheme}
              onChangeCardSize={onChangeCardSize}
              currentTheme={theme}
              currentCardSize={currentCardSize}
              onToggleSidebar={onToggleSidebar}
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
  );
};

export default AppHeader;
