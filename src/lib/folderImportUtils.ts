
import { Folder } from '@/lib/types';

/**
 * Process imported folders handling circular dependencies and hierarchy
 * with improved logging and error handling
 */
export const processFolders = (
  importedFolders: Folder[],
  addFolder: (name: string, image?: string, tags?: string[], parentId?: string) => Folder
): { folderIdMap: Map<string, string>, importedFolderCount: number } => {
  console.log(`Processing ${importedFolders.length} folders...`);
  
  // Track how many folders we've successfully imported
  let importedFolderCount = 0;
  
  // Initialize folderIdMap to track folder ID mappings
  const folderIdMap = new Map<string, string>();
  
  if (importedFolders.length === 0) {
    return { folderIdMap, importedFolderCount };
  }
  
  // Log some details about the folders we're processing
  console.log('First folder in import:', importedFolders[0]);
  
  // Create a map to track folder dependencies and their status
  const folderDependencies = new Map<string, Set<string>>();
  const processedFolderIds = new Set<string>();
  const circularDependencies = new Set<string>();
  
  // First pass: build dependency graph and validate folders
  importedFolders.forEach(folder => {
    if (!folder.id || !folder.name) {
      console.warn('Invalid folder data:', folder);
      return;
    }
    
    // Log folder information for debugging
    console.log(`Analyzing folder: "${folder.name}" (ID: ${folder.id}, Parent: ${folder.parentId || 'none'})`);
    
    if (folder.parentId) {
      // Verify parent folder exists in the import set
      const parentExists = importedFolders.some(f => f.id === folder.parentId);
      if (!parentExists) {
        console.warn(`Parent folder ${folder.parentId} not found for folder ${folder.name}`);
        // Still track this folder, but without parent dependency
      }
      
      if (!folderDependencies.has(folder.id)) {
        folderDependencies.set(folder.id, new Set());
      }
      
      if (parentExists) {
        folderDependencies.get(folder.id)?.add(folder.parentId as string);
      }
    }
  });
  
  // Function to detect circular dependencies using DFS
  const detectCircularDependencies = (folderId: string, visited: Set<string>, path: Set<string>) => {
    if (path.has(folderId)) {
      // Found a circular dependency
      console.warn(`Circular dependency detected with folder ID: ${folderId}`);
      path.forEach(id => circularDependencies.add(id));
      return true;
    }
    
    if (visited.has(folderId)) {
      return false;
    }
    
    visited.add(folderId);
    path.add(folderId);
    
    const dependencies = folderDependencies.get(folderId);
    if (dependencies) {
      for (const depId of dependencies) {
        if (detectCircularDependencies(depId, visited, path)) {
          return true;
        }
      }
    }
    
    path.delete(folderId);
    return false;
  };
  
  // Detect all circular dependencies
  importedFolders.forEach(folder => {
    if (!processedFolderIds.has(folder.id) && folder.id) {
      detectCircularDependencies(folder.id, new Set(), new Set());
    }
  });
  
  if (circularDependencies.size > 0) {
    console.warn(`Found ${circularDependencies.size} folders with circular dependencies`);
    console.warn('Circular dependencies:', Array.from(circularDependencies));
  }
  
  // Function to get folder depth (distance from root)
  const getFolderDepth = (folderId: string, depth: number = 0, visited: Set<string> = new Set()): number => {
    if (visited.has(folderId)) {
      return depth;
    }
    visited.add(folderId);
    
    const dependencies = folderDependencies.get(folderId);
    if (!dependencies || dependencies.size === 0) {
      return depth;
    }
    
    let maxDepth = depth;
    for (const depId of dependencies) {
      if (!circularDependencies.has(depId)) {
        maxDepth = Math.max(maxDepth, getFolderDepth(depId, depth + 1, visited));
      }
    }
    return maxDepth;
  };
  
  // Sort folders by depth (shallowest first) and handle circular dependencies
  const sortedFolders = [...importedFolders]
    .filter(folder => folder.id && folder.name) // Filter out invalid folders
    .sort((a, b) => {
      // Always place root folders (no parent) first
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      
      // If both have parents or both don't, sort by depth
      const depthA = getFolderDepth(a.id);
      const depthB = getFolderDepth(b.id);
      return depthA - depthB;
    });
  
  console.log(`Sorted ${sortedFolders.length} folders by hierarchy depth`);
  
  // Process folders in order
  sortedFolders.forEach((folder, index) => {
    try {
      let parentId: string | undefined;
      
      if (folder.parentId && !circularDependencies.has(folder.id)) {
        // If parent exists and this folder isn't part of a circular dependency
        const mappedParentId = folderIdMap.get(folder.parentId);
        if (mappedParentId) {
          parentId = mappedParentId;
          console.log(`Using mapped parent ID ${mappedParentId} for folder "${folder.name}"`);
        }
      }
      
      // Create the folder
      const newFolder = addFolder(
        folder.name,
        folder.image,
        folder.tags,
        parentId
      );
      
      if (!newFolder || !newFolder.id) {
        console.error('Failed to create folder:', folder.name);
        return;
      }
      
      folderIdMap.set(folder.id, newFolder.id);
      processedFolderIds.add(folder.id);
      importedFolderCount++;
      
      console.log(`Created folder "${folder.name}" with ID: ${newFolder.id}${parentId ? ` under parent: ${parentId}` : ''}`);
      
      // Log progress for larger imports
      if (index === 0 || index === sortedFolders.length - 1 || index % 10 === 0) {
        console.log(`Processed folder ${index + 1}/${sortedFolders.length}`);
      }
    } catch (error) {
      console.error(`Error creating folder "${folder.name}":`, error);
    }
  });
  
  // Log summary
  console.log(`Successfully processed ${importedFolderCount} out of ${importedFolders.length} folders`);
  console.log(`Created ${folderIdMap.size} folder mappings`);
  
  // Return the folderIdMap and count 
  return { folderIdMap, importedFolderCount };
};
