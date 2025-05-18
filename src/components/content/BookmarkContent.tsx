
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, Plus } from "lucide-react";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import { Bookmark, Folder } from "@/lib/bookmarkUtils";

interface BookmarkContentProps {
  currentFolder: Folder | null;
  showForm: boolean;
  bookmarks: Bookmark[];
  folders: Folder[];
  currentFolderId: string | null;
  selectedCollectionId: string | null;
  selectedTags: string[];
  searchQuery: string;
  cardSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
  handleAddBookmark: (bookmark: Bookmark) => void;
  setShowForm: (show: boolean) => void;
  setShowFolderForm: (show: boolean) => void;
  reorderBookmarks: (bookmarks: Bookmark[]) => void;
  handleTagSelect: (tag: string) => void;
  deleteBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteFolder: (id: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  onOpenFolder: (folderId: string) => void;
  handleMoveToFolder: (bookmarkId: string, folderId: string) => void;
  refreshBookmarks: () => void;
  getCurrentPageInfo: () => { title: string; url: string };
}

const BookmarkContent: React.FC<BookmarkContentProps> = ({
  currentFolder,
  showForm,
  bookmarks,
  folders,
  currentFolderId,
  selectedCollectionId,
  selectedTags,
  searchQuery,
  cardSize,
  theme,
  handleAddBookmark,
  setShowForm,
  setShowFolderForm,
  reorderBookmarks,
  handleTagSelect,
  deleteBookmark,
  updateBookmark,
  deleteFolder,
  updateFolder,
  onOpenFolder,
  handleMoveToFolder,
  refreshBookmarks,
  getCurrentPageInfo
}) => {
  const currentPage = getCurrentPageInfo();
  
  const hasContent = bookmarks.length > 0 || folders.length > 0;

  return (
    <main className="container max-w-full py-4 flex-1">
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
            onAddBookmark={(bookmark) => {
              handleAddBookmark(bookmark);
              // Auto refresh bookmarks
              refreshBookmarks();
            }}
            existingBookmarks={bookmarks}
            initialTitle={currentPage.title}
            initialUrl={currentPage.url}
          />
        </div>
      )}

      {/* Bookmark Grid */}
      <div className="w-full px-2">
        {hasContent ? (
          <BookmarkGrid
            bookmarks={bookmarks}
            folders={folders}
            onBookmarksReordered={reorderBookmarks}
            onTagClick={handleTagSelect}
            onDeleteBookmark={deleteBookmark}
            onUpdateBookmark={updateBookmark}
            onDeleteFolder={deleteFolder}
            onUpdateFolder={updateFolder}
            onOpenFolder={onOpenFolder}
            onMoveToFolder={handleMoveToFolder}
            cardSize={cardSize}
            currentFolderId={currentFolderId}
            selectedCollectionId={selectedCollectionId}
            selectedTags={selectedTags}
            searchQuery={searchQuery}
          />
        ) : (
          <EmptyState 
            theme={theme}
            bookmarksCount={bookmarks.length}
            setShowForm={setShowForm}
            setShowFolderForm={setShowFolderForm}
          />
        )}
      </div>
    </main>
  );
};

// Extracted EmptyState component
interface EmptyStateProps {
  theme: 'light' | 'dark';
  bookmarksCount: number;
  setShowForm: (show: boolean) => void;
  setShowFolderForm: (show: boolean) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme, bookmarksCount, setShowForm, setShowFolderForm }) => {
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow text-center mx-2`}>
      <h2 className="text-xl font-medium mb-2">No bookmarks found</h2>
      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
        {bookmarksCount === 0
          ? "Add your first bookmark to get started."
          : "Try adjusting your search or filter criteria."}
      </p>
      {bookmarksCount === 0 && (
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
  );
};

export default BookmarkContent;
