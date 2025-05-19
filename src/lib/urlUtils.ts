
// Helper function to validate and sanitize URLs
export const validateAndSanitizeUrl = (url: string): string | null => {
  try {
    // Basic URL validation
    const parsedUrl = new URL(url);
    
    // Check for common protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    // Sanitize the URL
    return parsedUrl.toString();
  } catch (e) {
    return null;
  }
};

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
