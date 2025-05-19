
// Generate tags automatically based on URL and title
export const generateAutoTags = (url: string, title: string, maxTags: number = 3): { tags: string[] } => {
  const tags: string[] = [];

  // Extract domain name for potential tag
  try {
    const domain = new URL(url).hostname
      .replace('www.', '')
      .split('.')
      .slice(0, -1)
      .join('.');
    
    if (domain && domain.length <= 15 && !domain.includes('.')) {
      tags.push(domain);
    }
  } catch (e) {
    // Invalid URL, skip domain tag
  }

  // Extract potential tags from title
  if (title) {
    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        word.length <= 15 && 
        !['http', 'https', 'www', 'com', 'net', 'org'].includes(word) &&
        !word.includes('.')
      );
    
    // Add unique title words as tags
    for (const word of titleWords) {
      if (tags.length < maxTags && !tags.includes(word)) {
        tags.push(word);
      }
    }
  }

  return { tags };
};
