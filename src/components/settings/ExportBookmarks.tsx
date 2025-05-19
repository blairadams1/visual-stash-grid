import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Bookmark, Folder } from '@/lib/bookmarkUtils';

interface ExportBookmarksProps {
  bookmarks: Bookmark[];
  folders: Folder[];
}

const ExportBookmarks: React.FC<ExportBookmarksProps> = ({ bookmarks, folders }) => {
  // Function to export bookmarks as JSON
  const exportBookmarksAsJSON = () => {
    const exportData = {
      version: "1.0",
      bookmarks: bookmarks,
      folders: folders,
      metadata: {
        exportDate: new Date().toISOString(),
        totalBookmarks: bookmarks.length,
        totalFolders: folders.length
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tagmarked-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Function to export bookmarks as HTML
  const exportBookmarksAsHTML = () => {
    // Create HTML bookmark file format
    let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n` + 
                     `<!-- This is an automatically generated file.\n` +
                     `     It will be read and overwritten.\n` +
                     `     DO NOT EDIT! -->\n` +
                     `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n` +
                     `<TITLE>Bookmarks</TITLE>\n` +
                     `<H1>Bookmarks</H1>\n` +
                     `<DL><p>\n`;
    
    // Helper function to recursively add folders and their bookmarks
    const addFolderContent = (folder: Folder, level: number = 0) => {
      const indent = '    '.repeat(level);
      htmlContent += `${indent}<DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${folder.name}</H3>\n`;
      htmlContent += `${indent}<DL><p>\n`;
      
      // Add bookmarks in this folder
      const folderBookmarks = bookmarks.filter(b => b.folderId === folder.id);
      folderBookmarks.forEach(bookmark => {
        const tags = bookmark.tags ? ` TAGS="${bookmark.tags.join(',')}"` : '';
        htmlContent += `${indent}    <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}"${tags}>${bookmark.title}</A>\n`;
      });
      
      // Add subfolders
      const subfolders = folders.filter(f => f.parentId === folder.id);
      subfolders.forEach(subfolder => addFolderContent(subfolder, level + 1));
      
      htmlContent += `${indent}</DL><p>\n`;
    };
    
    // Add root level folders (those without parents)
    const rootFolders = folders.filter(f => !f.parentId);
    rootFolders.forEach(folder => addFolderContent(folder));
    
    // Add bookmarks without folders
    const orphanedBookmarks = bookmarks.filter(b => !b.folderId);
    orphanedBookmarks.forEach(bookmark => {
      const tags = bookmark.tags ? ` TAGS="${bookmark.tags.join(',')}"` : '';
      htmlContent += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}"${tags}>${bookmark.title}</A>\n`;
    });
    
    // Close the HTML structure
    htmlContent += `</DL><p>\n`;
    
    // Create and trigger download
    const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tagmarked-bookmarks.html");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Export Bookmarks</h3>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={exportBookmarksAsJSON}
        >
          <Download className="mr-2 h-4 w-4" /> Export as JSON
        </Button>
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={exportBookmarksAsHTML}
        >
          <Download className="mr-2 h-4 w-4" /> Export as HTML
        </Button>
      </div>
    </div>
  );
};

export default ExportBookmarks;
