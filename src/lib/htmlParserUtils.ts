
import { Bookmark, Folder, createBookmark, createFolder } from '@/lib/bookmarkUtils';
import { validateHtmlStructure } from './validationUtils';
import { validateAndSanitizeUrl } from './urlUtils';
import { generateThumbnail } from './urlUtils';
import { generateAutomaticTags } from './tagUtils';

// Parse HTML bookmarks file with improved format detection and handling
export const parseHTMLBookmarks = (html: string) => {
  console.log('Starting HTML bookmark parsing...');
  console.log('HTML content length:', html.length);
  console.log('First 200 characters:', html.substring(0, 200));
  
  // Perform enhanced validation on the HTML structure
  if (!validateHtmlStructure(html)) {
    console.error('HTML validation failed: Invalid HTML bookmark file structure.');
    return {
      bookmarks: [],
      folders: [],
      error: "Invalid HTML bookmark file structure. The file format is not recognized as a standard bookmark export."
    };
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('DOM parser error:', parserError.textContent);
      return {
        bookmarks: [],
        folders: [],
        error: "Failed to parse HTML bookmark file. The file may be corrupted."
      };
    }
    
    // Log the document structure to help with debugging
    console.log('Document parse successful, title:', doc.title);
    console.log('Root element children count:', doc.body.children.length);
    
    const importedBookmarks: Bookmark[] = [];
    const importedFolders: Map<string, Folder> = new Map();
    const folderRelationships: Map<string, string> = new Map();
    
    // Generate random IDs for folder mapping
    const generateId = () => `folder-${Math.random().toString(36).substring(2, 9)}`;
    
    // Step 1: Mark all folder elements with IDs for reference
    const markFolderElements = () => {
      console.log('Marking folder elements...');
      
      // Find all DL elements which typically represent folders
      const dlElements = doc.querySelectorAll('dl');
      console.log(`Found ${dlElements.length} DL elements (potential folders)`);
      
      // Mark each DL element with a unique ID
      dlElements.forEach((dl, index) => {
        const folderId = generateId();
        dl.setAttribute('data-temp-id', folderId);
        console.log(`Marked DL #${index} with ID: ${folderId}`);
      });
    };
    
    // Step 2: Process folders (DT elements with H3 and DL children)
    const processFolders = () => {
      console.log('Processing folders...');
      
      // Find all potential folder headings (H3 elements)
      const folderHeadings = doc.querySelectorAll('h3');
      console.log(`Found ${folderHeadings.length} folder headings (H3 elements)`);
      
      folderHeadings.forEach((h3, index) => {
        // Get folder name from heading
        const folderName = h3.textContent?.trim() || `Folder ${index + 1}`;
        console.log(`Processing folder: "${folderName}"`);
        
        // Get the parent DT and then the DL that follows it (folder contents)
        const parentDT = h3.closest('dt');
        if (!parentDT) {
          console.log(`No parent DT found for folder "${folderName}"`);
          return;
        }
        
        // Find the DL that contains this folder's contents
        const folderDL = parentDT.querySelector('dl');
        if (!folderDL) {
          console.log(`No content DL found for folder "${folderName}"`);
          return;
        }
        
        // Get the folder's unique ID we marked earlier
        const folderId = folderDL.getAttribute('data-temp-id');
        if (!folderId) {
          console.log(`No ID found for folder "${folderName}"`);
          return;
        }
        
        // Create the folder
        const newFolder = createFolder(folderName);
        importedFolders.set(folderId, newFolder);
        console.log(`Created folder "${folderName}" with ID: ${newFolder.id}`);
        
        // Find parent folder relationship
        const parentDL = findParentDL(parentDT);
        if (parentDL) {
          const parentId = parentDL.getAttribute('data-temp-id');
          if (parentId) {
            folderRelationships.set(folderId, parentId);
            console.log(`Set parent relationship: "${folderName}" → parent ID: ${parentId}`);
          }
        }
      });
    };
    
    // Find the parent DL for an element (used for folder hierarchy)
    const findParentDL = (element: Element): Element | null => {
      let parent = element.parentElement;
      while (parent) {
        if (parent.tagName.toLowerCase() === 'dl' && parent.hasAttribute('data-temp-id')) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };
    
    // Step 3: Process folder relationships to set parentId
    const establishFolderHierarchy = () => {
      console.log('Establishing folder hierarchy...');
      console.log(`Processing ${folderRelationships.size} parent-child relationships`);
      
      folderRelationships.forEach((parentTempId, childTempId) => {
        const childFolder = importedFolders.get(childTempId);
        const parentFolder = importedFolders.get(parentTempId);
        
        if (childFolder && parentFolder) {
          childFolder.parentId = parentFolder.id;
          console.log(`Set "${childFolder.name}" (${childFolder.id}) as child of "${parentFolder.name}" (${parentFolder.id})`);
        }
      });
    };
    
    // Step 4: Find all bookmarks (A elements)
    const processBookmarks = () => {
      console.log('Processing bookmarks...');
      
      // Find all link elements
      const links = doc.querySelectorAll('a');
      console.log(`Found ${links.length} links (potential bookmarks)`);
      
      links.forEach((link, index) => {
        // Get and validate the URL
        const url = link.getAttribute('href');
        if (!url || !validateAndSanitizeUrl(url)) {
          console.log(`Skipping invalid URL at index ${index}: ${url}`);
          return;
        }
        
        // Get bookmark title
        const title = link.textContent?.trim() || url;
        
        // Extract tags if available
        let tags: string[] = [];
        const tagsAttr = link.getAttribute('tags') || link.getAttribute('TAGS');
        if (tagsAttr) {
          tags = tagsAttr.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        
        // Generate automatic tags if needed
        if (tags.length < 3) {
          const generatedTags = generateAutomaticTags(url, title);
          tags = [...new Set([...tags, ...generatedTags])];
        }
        
        // Generate thumbnail for the bookmark
        const thumbnail = generateThumbnail(url);
        
        // Find the folder this bookmark belongs to
        let parentFolderId: string | undefined;
        
        // Find parent folder by traversing up to find the containing DL
        const parentDT = link.closest('dt');
        if (parentDT) {
          const parentDL = findParentDL(parentDT);
          if (parentDL) {
            const folderTempId = parentDL.getAttribute('data-temp-id');
            if (folderTempId && importedFolders.has(folderTempId)) {
              parentFolderId = importedFolders.get(folderTempId)?.id;
              
              if (parentFolderId) {
                console.log(`Bookmark "${title}" belongs to folder ID: ${parentFolderId}`);
              }
            }
          }
        }
        
        // Create the bookmark
        const newBookmark = createBookmark(
          title,
          url,
          thumbnail,
          tags,
          parentFolderId
        );
        
        // Add to imported bookmarks
        importedBookmarks.push(newBookmark);
        
        // Log periodically to avoid flooding the console
        if (index < 5 || index % 20 === 0) {
          console.log(`Processed bookmark ${index + 1}/${links.length}: "${title}" with ID ${newBookmark.id}`);
        }
      });
    };
    
    // Execute the parsing steps in order
    markFolderElements();
    processFolders();
    establishFolderHierarchy();
    processBookmarks();
    
    // Convert the folder map to an array
    const folderArray = Array.from(importedFolders.values());
    
    // Log summary of results
    console.log(`HTML parsing complete: Found ${importedBookmarks.length} bookmarks and ${folderArray.length} folders`);
    
    if (importedBookmarks.length === 0 && folderArray.length === 0) {
      console.warn('No bookmarks or folders were found in the HTML file.');
      return {
        bookmarks: [],
        folders: [],
        error: "No valid bookmarks or folders found. The file may not be a standard bookmark export format."
      };
    }
    
    // Return processed bookmarks and folders
    return {
      bookmarks: importedBookmarks,
      folders: folderArray,
      error: null
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
