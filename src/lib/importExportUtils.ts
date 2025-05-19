
import { Bookmark, Folder, createBookmark, createFolder } from '@/lib/bookmarkUtils';

// Generate thumbnail based on URL
export const generateThumbnail = (url: string): string => {
  // Try to extract domain for favicon
  try {
    const domain = new URL(url).hostname;
    // Return a fallback image or try to get favicon
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    // Return a placeholder image if URL is invalid
    return `https://via.placeholder.com/300x200/f0f0f0/808080?text=${encodeURIComponent(url)}`;
  }
};

// Generate automatic tags based on URL and title
export const generateAutomaticTags = (url: string, title: string): string[] => {
  const tags = new Set<string>();
  
  // Extract domain as a tag
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const domainParts = domain.split('.');
    if (domainParts.length > 0) {
      tags.add(domainParts[0]); // Add the main domain name as a tag
    }
  } catch (e) {
    // Skip if URL is invalid
  }
  
  // Extract key words from title
  if (title) {
    // Split the title into words
    const words = title.toLowerCase().split(/\s+/);
    
    // Common words to filter out
    const commonWords = new Set(['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
    
    // Add meaningful words from title as tags (if they're at least 4 characters)
    words.forEach(word => {
      // Clean the word of special characters
      const cleanWord = word.replace(/[^\w\s]/gi, '');
      if (cleanWord.length >= 4 && !commonWords.has(cleanWord)) {
        tags.add(cleanWord);
      }
    });
  }
  
  // Add category tags based on URL patterns
  if (url.includes('github.com')) tags.add('developer');
  if (url.includes('youtube.com') || url.includes('vimeo.com')) tags.add('video');
  if (url.includes('docs.google.com')) tags.add('document');
  if (url.includes('medium.com') || url.includes('blog')) tags.add('blog');
  
  // Limit to 3-4 tags and convert Set back to array
  return Array.from(tags).slice(0, 4);
};

// Parse HTML bookmarks file - completely rewritten for better folder structure handling
export const parseHTMLBookmarks = (html: string) => {
  console.log('Starting HTML bookmark parsing...');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const importedBookmarks: Bookmark[] = [];
  const importedFolders: Map<string, Folder> = new Map(); // Use a map for easier reference
  const folderRelationships: Map<string, string> = new Map(); // Child ID to parent ID mapping
  
  // First find all folders (DT elements with H3 and DL)
  const findFolders = () => {
    console.log('Finding folders...');
    const folderItems = Array.from(doc.querySelectorAll('dt'));
    
    folderItems.forEach(dt => {
      const h3 = dt.querySelector('h3');
      const dl = dt.querySelector('dl');
      
      if (h3 && dl) {
        const folderName = h3.textContent?.trim() || 'Imported Folder';
        const folderId = `folder-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create the folder
        const newFolder = createFolder(folderName);
        
        // Store the folder and its HTML element ID for reference
        importedFolders.set(folderId, newFolder);
        
        // Mark this DL element with our folder ID for bookmark assignment
        dl.setAttribute('data-folder-id', folderId);
        
        // Find parent-child relationships (we'll process these after all folders are created)
        const parentDL = findParentDL(dt);
        if (parentDL) {
          const parentFolderId = parentDL.getAttribute('data-folder-id');
          if (parentFolderId) {
            // Remember this relationship to set parentId after all folders are created
            folderRelationships.set(folderId, parentFolderId);
          }
        }
      }
    });
    
    console.log(`Found ${importedFolders.size} folders`);
  };
  
  // Helper function to find parent DL element
  const findParentDL = (element: Element): Element | null => {
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'DL' && parent.hasAttribute('data-folder-id')) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };
  
  // Process folder relationships to set parentIds
  const processFolderRelationships = () => {
    console.log('Processing folder relationships...');
    folderRelationships.forEach((parentId, childId) => {
      const childFolder = importedFolders.get(childId);
      if (childFolder) {
        childFolder.parentId = importedFolders.get(parentId)?.id;
      }
    });
  };
  
  // Find all bookmarks (A elements)
  const findBookmarks = () => {
    console.log('Finding bookmarks...');
    const links = doc.querySelectorAll('a');
    
    links.forEach(link => {
      const url = link.getAttribute('href');
      if (!url) return;
      
      const title = link.textContent?.trim() || url;
      
      // Get tags from attributes if available
      const tagsAttr = link.getAttribute('tags') || '';
      let tags: string[] = tagsAttr ? tagsAttr.split(',').map(tag => tag.trim()) : [];
      
      // Generate automatic tags if we don't have enough
      if (tags.length < 3) {
        const generatedTags = generateAutomaticTags(url, title);
        tags = [...new Set([...tags, ...generatedTags])];
      }
      
      const thumbnail = generateThumbnail(url);
      
      // Find parent folder
      let folderId: string | undefined = undefined;
      const parentDL = findParentDL(link);
      if (parentDL) {
        const folderDataId = parentDL.getAttribute('data-folder-id');
        if (folderDataId) {
          const folder = importedFolders.get(folderDataId);
          if (folder) {
            folderId = folder.id;
          }
        }
      }
      
      // Create the bookmark
      const newBookmark = createBookmark(
        title, 
        url, 
        thumbnail, 
        tags, 
        folderId
      );
      
      importedBookmarks.push(newBookmark);
    });
    
    console.log(`Found ${importedBookmarks.length} bookmarks`);
  };
  
  // Process the document in order: folders first, then relationships, then bookmarks
  findFolders();
  processFolderRelationships();
  findBookmarks();
  
  // Convert the folder Map to an array for returning
  const folderArray = Array.from(importedFolders.values());
  
  console.log(`Parsed ${importedBookmarks.length} bookmarks and ${folderArray.length} folders from HTML`);
  
  return { 
    bookmarks: importedBookmarks, 
    folders: folderArray, 
    error: null 
  };
};

// Process imported JSON bookmarks
export const processJSONBookmarks = (jsonData: any) => {
  if (!Array.isArray(jsonData)) {
    return { bookmarks: [], folders: [], error: "Invalid JSON format. Expected an array of bookmarks." };
  }
  
  const importedBookmarks: Bookmark[] = [];
  
  jsonData.forEach(item => {
    if (typeof item === 'object' && item !== null && item.url) {
      // Basic validation
      const url = item.url?.toString() || '';
      const title = item.title?.toString() || url;
      
      // Use existing tags or generate new ones
      let tags = Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : [];
      if (tags.length < 3) {
        // Add generated tags if we don't have enough
        const generatedTags = generateAutomaticTags(url, title);
        // Combine and ensure uniqueness
        const allTags = [...new Set([...tags, ...generatedTags])];
        tags = allTags.slice(0, 4); // Limit to 4 tags
      }
      
      // Use existing thumbnail or generate one
      const thumbnail = item.thumbnail || generateThumbnail(url);
      
      // Create the bookmark
      const newBookmark = createBookmark(
        title, 
        url, 
        thumbnail, 
        tags, 
        item.folderId
      );
      
      importedBookmarks.push(newBookmark);
    }
  });
  
  return { bookmarks: importedBookmarks, folders: [], error: null };
};
