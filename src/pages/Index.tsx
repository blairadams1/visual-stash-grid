
import { usePageFunctionality } from "@/hooks/usePageFunctionality";
import MainLayout from "@/components/layout/MainLayout";
import AppHeader from "@/components/header/AppHeader";
import BookmarkContent from "@/components/content/BookmarkContent";

const Index = () => {
  // Use our custom hook to access all functionality
  const {
    bookmarks,
    folders,
    searchQuery,
    setSearchQuery,
    selectedTags,
    showForm,
    setShowForm,
    showFolderForm,
    setShowFolderForm,
    isFilterOpen,
    setIsFilterOpen,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    showSidebar,
    setShowSidebar,
    selectedCollectionId,
    setSelectedCollectionId,
    theme,
    setTheme,
    cardSize,
    setCardSize,
    justImported,
    refreshBookmarks,
    handleAddBookmark,
    handleAddFolder,
    handleImportBookmarks,
    handleTagSelect,
    handleTagDeselect,
    handleClearAllTags,
    handleOpenFolder,
    handleMoveToFolder,
    getCurrentPageInfo,
    toggleSidebar,
    deleteBookmark,
    updateBookmark,
    deleteFolder,
    updateFolder,
    reorderBookmarks
  } = usePageFunctionality();

  return (
    <MainLayout
      showSidebar={showSidebar}
      toggleSidebar={toggleSidebar}
      selectedCollectionId={selectedCollectionId}
      setSelectedCollectionId={setSelectedCollectionId}
      theme={theme}
    >
      <AppHeader
        theme={theme}
        showForm={showForm}
        searchQuery={searchQuery}
        currentFolder={currentFolder}
        setShowForm={setShowForm}
        setShowFolderForm={setShowFolderForm}
        setCurrentFolderId={setCurrentFolderId}
        showFolderForm={showFolderForm}
        refreshBookmarks={refreshBookmarks}
        setIsFilterOpen={setIsFilterOpen}
        isFilterOpen={isFilterOpen}
        selectedTags={selectedTags}
        onChangeTheme={setTheme}
        onChangeCardSize={setCardSize}
        currentCardSize={cardSize}
        onToggleSidebar={toggleSidebar}
        handleImportBookmarks={handleImportBookmarks}
        handleTagSelect={handleTagSelect}
        handleTagDeselect={handleTagDeselect}
        handleClearAllTags={handleClearAllTags}
        setSearchQuery={setSearchQuery}
        handleAddFolder={handleAddFolder}
        bookmarks={bookmarks}
      />
      
      <BookmarkContent
        currentFolder={currentFolder}
        showForm={showForm}
        bookmarks={bookmarks}
        folders={folders}
        currentFolderId={currentFolderId}
        selectedCollectionId={selectedCollectionId}
        selectedTags={selectedTags}
        searchQuery={searchQuery}
        cardSize={cardSize}
        theme={theme}
        justImported={justImported}
        handleAddBookmark={handleAddBookmark}
        setShowForm={setShowForm}
        setShowFolderForm={setShowFolderForm}
        reorderBookmarks={reorderBookmarks}
        handleTagSelect={handleTagSelect}
        deleteBookmark={deleteBookmark}
        updateBookmark={updateBookmark}
        deleteFolder={deleteFolder}
        updateFolder={updateFolder}
        onOpenFolder={handleOpenFolder}
        handleMoveToFolder={handleMoveToFolder}
        refreshBookmarks={refreshBookmarks}
        getCurrentPageInfo={getCurrentPageInfo}
      />
    </MainLayout>
  );
};

export default Index;
