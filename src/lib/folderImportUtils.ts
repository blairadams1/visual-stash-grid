
import { Folder } from '@/lib/bookmarkUtils';

/**
 * Process imported folders handling circular dependencies and hierarchy
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
  
  // Create a map to track folder dependencies and their status
  const folderDependencies = new Map<string, Set<string>>();
  const processedFolderIds = new Set<string>();
  const circularDependencies = new Set<string>();
  
  // First pass: build dependency graph
  importedFolders.forEach(folder => {
    if (folder.parentId) {
      if (!folderDependencies.has(folder.id)) {
        folderDependencies.set(folder.id, new Set());
      }
      folderDependencies.get(folder.id)?.add(folder.parentId);
    }
  });
  
  // Function to detect circular dependencies using DFS
  const detectCircularDependencies = (folderId: string, visited: Set<string>, path: Set<string>) => {
    if (path.has(folderId)) {
      // Found a circular dependency
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
    if (!processedFolderIds.has(folder.id)) {
      detectCircularDependencies(folder.id, new Set(), new Set());
    }
  });
  
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
  const sortedFolders = [...importedFolders].sort((a, b) => {
    const depthA = getFolderDepth(a.id);
    const depthB = getFolderDepth(b.id);
    return depthA - depthB;
  });
  
  // Process folders in order
  sortedFolders.forEach(folder => {
    let parentId: string | undefined;
    
    if (folder.parentId && !circularDependencies.has(folder.id)) {
      // If parent exists and this folder isn't part of a circular dependency
      const mappedParentId = folderIdMap.get(folder.parentId);
      if (mappedParentId) {
        parentId = mappedParentId;
      }
    }
    
    // Create the folder
    const newFolder = addFolder(
      folder.name,
      folder.image,
      folder.tags,
      parentId
    );
    
    folderIdMap.set(folder.id, newFolder.id);
    processedFolderIds.add(folder.id);
    importedFolderCount++;
    
    console.log(`Created folder "${folder.name}" with ID: ${newFolder.id}${parentId ? ` under parent: ${parentId}` : ''}`);
  });
  
  // Return the folderIdMap and count 
  return { folderIdMap, importedFolderCount };
};
