
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
