
import { Bookmark, Folder, createBookmark, createFolder } from '@/lib/bookmarkUtils';
import { validateHtmlStructure } from './validationUtils';
import { validateAndSanitizeUrl } from './urlUtils';
import { generateThumbnail } from './urlUtils';
import { generateAutomaticTags } from './tagUtils';

// Parse HTML bookmarks file with improved validation
export const parseHTMLBookmarks = (html: string) => {
  console.log('Starting HTML bookmark parsing...');
  
  // Validate HTML structure
  if (!validateHtmlStructure(html)) {
    return {
      bookmarks: [],
      folders: [],
      error: "Invalid HTML bookmark file structure. Missing required elements."
    };
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        bookmarks: [],
        folders: [],
        error: "Failed to parse HTML bookmark file. The file may be corrupted."
      };
    }
    
    const importedBookmarks: Bookmark[] = [];
    const importedFolders: Map<string, Folder> = new Map();
    const folderRelationships: Map<string, string> = new Map();
    const validationErrors: string[] = [];
    
    // Initialize folderIdMap to track folder ID conversions
    const folderIdMap = new Map<string, string>();
    
    // First find all folders (DT elements with H3 and DL)
    const findFolders = () => {
      console.log('Finding folders...');
      
      const folderItems = Array.from(doc.querySelectorAll('dt'));
      console.log(`Found ${folderItems.length} potential folder elements`);
      
      folderItems.forEach((dt, index) => {
        const h3 = dt.querySelector('h3');
        const dl = dt.querySelector('dl');
        
        if (h3 && dl) {
          const folderName = h3.textContent?.trim() || `Imported Folder ${index}`;
          
          // Validate folder name
          if (!folderName) {
            validationErrors.push(`Folder at index ${index} has no name`);
            return;
          }
          
          const folderId = `folder-${Math.random().toString(36).substr(2, 9)}`;
          const newFolder = createFolder(folderName);
          
          importedFolders.set(folderId, newFolder);
          folderIdMap.set(folderId, newFolder.id);
          dl.setAttribute('data-folder-id', folderId);
          
          const parentDL = findParentDL(dt);
          if (parentDL) {
            const parentFolderId = parentDL.getAttribute('data-folder-id');
            if (parentFolderId) {
              folderRelationships.set(folderId, parentFolderId);
            }
          }
        }
      });
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
    
    // Process folder relationships
    const processFolderRelationships = () => {
      folderRelationships.forEach((parentId, childId) => {
        const childFolder = importedFolders.get(childId);
        const parentFolder = importedFolders.get(parentId);
        
        if (childFolder && parentFolder) {
          childFolder.parentId = parentFolder.id;
        }
      });
    };
    
    // Find and validate all bookmarks
    const findBookmarks = () => {
      console.log('Finding bookmarks...');
      const links = doc.querySelectorAll('a');
      console.log(`Found ${links.length} links in HTML`);
      
      links.forEach((link, index) => {
        const url = link.getAttribute('href');
        
        // Skip invalid URLs
        if (!url || url.startsWith('javascript:') || url === '#') {
          validationErrors.push(`Bookmark at index ${index} has invalid URL: ${url}`);
          return;
        }
        
        // Validate and sanitize URL
        const sanitizedUrl = validateAndSanitizeUrl(url);
        if (!sanitizedUrl) {
          validationErrors.push(`Bookmark at index ${index} has invalid URL format: ${url}`);
          return;
        }
        
        const title = link.textContent?.trim() || sanitizedUrl;
        
        // Get and validate tags
        const tagsAttr = link.getAttribute('tags') || '';
        let tags: string[] = tagsAttr ? tagsAttr.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        // Generate automatic tags if needed
        if (tags.length < 3) {
          const generatedTags = generateAutomaticTags(sanitizedUrl, title);
          tags = [...new Set([...tags, ...generatedTags])];
        }
        
        const thumbnail = generateThumbnail(sanitizedUrl);
        
        // Find and validate parent folder
        let folderId: string | undefined = undefined;
        const parentDT = link.closest('dt');
        if (parentDT) {
          const parentDL = findParentDL(parentDT);
          if (parentDL) {
            const folderDataId = parentDL.getAttribute('data-folder-id');
            if (folderDataId && importedFolders.has(folderDataId)) {
              // Use the mapped ID from our folderIdMap
              folderId = folderIdMap.get(folderDataId);
            }
          }
        }
        
        // Create the bookmark
        const newBookmark = createBookmark(
          title,
          sanitizedUrl,
          thumbnail,
          tags,
          folderId
        );
        
        importedBookmarks.push(newBookmark);
      });
    };
    
    // Process the document
    findFolders();
    processFolderRelationships();
    findBookmarks();
    
    // Log stats about what we found
    console.log(`HTML parsing complete: Found ${importedBookmarks.length} bookmarks and ${importedFolders.size} folders`);
    
    // Convert folders to array
    const folderArray = Array.from(importedFolders.values());
    
    // Return results with any validation errors
    return {
      bookmarks: importedBookmarks,
      folders: folderArray,
      error: validationErrors.length > 0 
        ? `Import completed with ${validationErrors.length} validation errors: ${validationErrors.join('; ')}`
        : importedBookmarks.length === 0 && folderArray.length === 0 
          ? "No valid bookmarks or folders found in the HTML"
          : null
    };
  } catch (error) {
    console.error('Error parsing HTML bookmarks:', error);
    return {
      bookmarks: [],
      folders: [],
      error: `Failed to parse HTML bookmarks: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
