
import { Bookmark, Folder, Collection } from "@/lib/bookmarkUtils";

export const useFilterUtils = (
  bookmarks: Bookmark[],
  folders: Folder[] = [],
  selectedCollectionId: string | null = null,
  currentFolderId: string | null = null,
  selectedTags: string[] = [],
  searchQuery: string = '',
  collections: Collection[] = [],
  justImported: boolean = false
) => {
  // Function to get all subcollection IDs recursively
  const getSubCollectionIds = (parentId: string): string[] => {
    const result: string[] = [];
    
    const childCollections = collections.filter(c => c.parentId === parentId);
    childCollections.forEach(collection => {
      result.push(collection.id);
      result.push(...getSubCollectionIds(collection.id));
    });
    
    return result;
  };

  // Filter and group bookmarks by collection, folder, tags, and search query
  const getFilteredItems = () => {
    // Start with all bookmarks
    let filteredBookmarks = [...bookmarks];
    let filteredFolders = [...folders];
    
    // If we just imported, show all bookmarks and folders
    if (justImported) {
      console.log('Just imported, showing all bookmarks and folders');
      return { bookmarks: filteredBookmarks, folders: filteredFolders };
    }
    
    // Filter by collection if selected
    if (selectedCollectionId) {
      const subCollectionIds = getSubCollectionIds(selectedCollectionId);
      filteredBookmarks = filteredBookmarks.filter(
        bookmark => bookmark.collectionId === selectedCollectionId || 
                  (bookmark.collectionId && subCollectionIds.includes(bookmark.collectionId))
      );
      
      filteredFolders = filteredFolders.filter(
        folder => folder.collectionId === selectedCollectionId || 
                 (folder.collectionId && subCollectionIds.includes(folder.collectionId))
      );
    }
    
    // Filter by current folder if set
    if (currentFolderId !== null) {
      filteredBookmarks = filteredBookmarks.filter(bookmark => bookmark.folderId === currentFolderId);
      // Don't show folders when inside a folder
      filteredFolders = [];
    } else {
      // If not in a folder view, only show bookmarks that are not in any folder
      filteredBookmarks = filteredBookmarks.filter(bookmark => !bookmark.folderId);
    }
    
    // Filter by selected tags
    if (selectedTags && selectedTags.length > 0) {
      filteredBookmarks = filteredBookmarks.filter(bookmark => 
        selectedTags.every(tag => bookmark.tags && bookmark.tags.includes(tag))
      );
      
      filteredFolders = filteredFolders.filter(folder => 
        folder.tags && selectedTags.every(tag => folder.tags.includes(tag))
      );
    }
    
    // Filter by search query
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filteredBookmarks = filteredBookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) || 
        bookmark.url.toLowerCase().includes(query) ||
        (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      
      filteredFolders = filteredFolders.filter(folder => 
        folder.name.toLowerCase().includes(query) ||
        (folder.tags && folder.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    console.log(`Filtered to ${filteredBookmarks.length} bookmarks and ${filteredFolders.length} folders`);
    
    return { bookmarks: filteredBookmarks, folders: filteredFolders };
  };

  return {
    getFilteredItems,
    getSubCollectionIds
  };
};
