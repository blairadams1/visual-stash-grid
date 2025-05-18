
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

// Parse HTML bookmarks file
export const parseHTMLBookmarks = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  
  const importedBookmarks: Bookmark[] = [];
  const importedFolders: Folder[] = [];
  const folderMap: Record<string, Folder> = {};
  
  // Process folder structure first
  const processFolder = (element: Element, parentFolderId?: string) => {
    // Get all direct DT children that contain folders (DL)
    const folderItems = element.querySelectorAll(':scope > dt');
    
    folderItems.forEach(folderItem => {
      const h3 = folderItem.querySelector('h3');
      const dl = folderItem.querySelector('dl');
      
      if (h3 && dl) {
        // This is a folder
        const folderName = h3.textContent || 'Imported Folder';
        const newFolder = createFolder(folderName, undefined, [], importedFolders, parentFolderId);
        
        importedFolders.push(newFolder);
        folderMap[dl.id || `folder_${importedFolders.length}`] = newFolder;
        
        // Process links within this folder
        processFolder(dl, newFolder.id);
      } else {
        // This might be a direct bookmark
        const link = folderItem.querySelector('a');
        if (link) {
          const url = link.getAttribute('href') || '';
          const title = link.textContent || url;
          const tagsAttr = link.getAttribute('tags') || '';
          
          // Get tags from the TAGS attribute if available
          let initialTags: string[] = [];
          if (tagsAttr) {
            initialTags = tagsAttr.split(',').map(tag => tag.trim());
          }
          
          // Generate automatic tags if we don't have enough
          if (initialTags.length < 3) {
            const generatedTags = generateAutomaticTags(url, title);
            // Combine and ensure uniqueness
            const allTags = [...new Set([...initialTags, ...generatedTags])];
            initialTags = allTags.slice(0, 4); // Limit to 4 tags
          }
          
          const thumbnail = generateThumbnail(url);
          const newBookmark = createBookmark(
            title, 
            url, 
            thumbnail, 
            initialTags, 
            parentFolderId
          );
          
          importedBookmarks.push(newBookmark);
        }
      }
    });
  };
  
  // Start processing from the main DL element
  const mainDL = doc.querySelector('dl');
  if (mainDL) {
    processFolder(mainDL);
  } else {
    // Fallback to just grabbing all links if structure doesn't match expected format
    links.forEach(link => {
      const url = link.getAttribute('href') || '';
      const title = link.textContent || url;
      const tags = generateAutomaticTags(url, title);
      const thumbnail = generateThumbnail(url);
      
      const newBookmark = createBookmark(
        title, 
        url, 
        thumbnail, 
        tags
      );
      
      importedBookmarks.push(newBookmark);
    });
  }
  
  return { bookmarks: importedBookmarks, folders: importedFolders, error: null };
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
