import { Folder } from '@/lib/types';

/**
 * Process imported folders, creating them in the app and maintaining hierarchy
 * @param importedFolders The folders to import
 * @param addFolder Function to add a folder to the system
 * @returns Object containing the mapping of original IDs to new IDs and count of imported folders
 */
export const processFolders = (importedFolders: Folder[], addFolder: (name: string, image?: string, tags?: string[], parentId?: string) => Folder) => {
  // Create map to track original folder IDs to new folder IDs
  const folderIdMap = new Map<string, string>();
  const errors: string[] = [];
  let importedFolderCount = 0;
  
  console.log(`Processing ${importedFolders.length} imported folders`);
  
  // Process folders without parents first
  const rootFolders = importedFolders.filter(folder => !folder.parentId);
  const nonRootFolders = importedFolders.filter(folder => folder.parentId);
  
  console.log(`Found ${rootFolders.length} root folders and ${nonRootFolders.length} child folders`);
  
  // First, process all root folders (those without parents)
  rootFolders.forEach(folder => {
    try {
      const newFolder = addFolder(
        folder.name,
        folder.image,
        folder.tags
      );
      
      folderIdMap.set(folder.id, newFolder.id);
      importedFolderCount++;
      console.log(`Added root folder "${folder.name}" with ID ${newFolder.id} (was ${folder.id})`);
    } catch (error) {
      const errorMsg = `Error importing root folder "${folder.name}": ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  });
  
  // Then try to process non-root folders with multiple passes to handle nesting
  // This approach handles arbitrary depth of folder hierarchy
  let remainingFolders = [...nonRootFolders];
  let previousLength = -1;
  let maxAttempts = 10; // Prevent infinite loops
  
  while (remainingFolders.length > 0 && previousLength !== remainingFolders.length && maxAttempts > 0) {
    previousLength = remainingFolders.length;
    maxAttempts--;
    
    console.log(`Processing batch of ${remainingFolders.length} child folders, attempt ${10 - maxAttempts}`);
    
    // Try to process each folder, keep track of ones we couldn't process yet
    const stillRemaining: Folder[] = [];
    
    for (const folder of remainingFolders) {
      // Check if parent folder has been processed
      if (!folder.parentId || folderIdMap.has(folder.parentId)) {
        try {
          // Get mapped parent ID if it exists
          const mappedParentId = folder.parentId ? folderIdMap.get(folder.parentId) : undefined;
          
          const newFolder = addFolder(
            folder.name,
            folder.image,
            folder.tags,
            mappedParentId
          );
          
          folderIdMap.set(folder.id, newFolder.id);
          importedFolderCount++;
          console.log(`Added child folder "${folder.name}" with ID ${newFolder.id} ${mappedParentId ? `under parent ${mappedParentId}` : '(missing parent)'}`);
        } catch (error) {
          const errorMsg = `Error importing child folder "${folder.name}": ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      } else {
        // Can't process yet, parent hasn't been created
        stillRemaining.push(folder);
      }
    }
    
    remainingFolders = stillRemaining;
  }
  
  // If we still have folders left, they have circular dependencies
  if (remainingFolders.length > 0) {
    console.warn(`Could not import ${remainingFolders.length} folders due to circular dependencies or missing parents`);
    errors.push(`${remainingFolders.length} folders had circular dependencies or missing parents and were skipped.`);
    
    // Import these without parent relationships as a fallback
    remainingFolders.forEach(folder => {
      try {
        const newFolder = addFolder(
          folder.name,
          folder.image,
          folder.tags
          // No parent ID - we're breaking the circular dependency
        );
        
        folderIdMap.set(folder.id, newFolder.id);
        importedFolderCount++;
        console.log(`Added orphaned folder "${folder.name}" with ID ${newFolder.id} (original parent relationship broken)`);
      } catch (error) {
        const errorMsg = `Error importing orphaned folder "${folder.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    });
  }
  
  console.log(`Folder processing complete. Imported ${importedFolderCount}/${importedFolders.length} folders.`);
  
  return { folderIdMap, importedFolderCount, errors };
};
