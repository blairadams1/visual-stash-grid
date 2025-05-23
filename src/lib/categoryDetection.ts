
// Category detection system for analyzing URLs and content to determine site types
export interface CategoryInfo {
  name: string;
  color: string;
  icon: string;
  patterns: string[];
  keywords: string[];
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  development: {
    name: 'Development',
    color: '#2563eb',
    icon: '👨‍💻',
    patterns: ['github', 'gitlab', 'stackoverflow', 'codepen', 'npm', 'dev.to', 'repl.it'],
    keywords: ['code', 'programming', 'development', 'api', 'documentation', 'tutorial', 'framework', 'library']
  },
  documentation: {
    name: 'Documentation',
    color: '#059669',
    icon: '📚',
    patterns: ['docs.', '/docs/', 'developer.', 'api.', 'guide', 'manual'],
    keywords: ['docs', 'documentation', 'guide', 'tutorial', 'manual', 'reference', 'api']
  },
  social: {
    name: 'Social',
    color: '#dc2626',
    icon: '👥',
    patterns: ['twitter', 'facebook', 'instagram', 'linkedin', 'reddit', 'discord', 'telegram'],
    keywords: ['social', 'network', 'community', 'chat', 'forum', 'discussion']
  },
  video: {
    name: 'Video',
    color: '#7c3aed',
    icon: '📺',
    patterns: ['youtube', 'vimeo', 'twitch', 'netflix', 'video'],
    keywords: ['video', 'streaming', 'watch', 'movie', 'tv', 'channel', 'live']
  },
  shopping: {
    name: 'Shopping',
    color: '#ea580c',
    icon: '🛒',
    patterns: ['amazon', 'ebay', 'etsy', 'shop', 'store', 'buy'],
    keywords: ['shop', 'store', 'buy', 'purchase', 'cart', 'product', 'sale', 'price']
  },
  blog: {
    name: 'Blog',
    color: '#0891b2',
    icon: '✍️',
    patterns: ['medium', 'substack', 'blog', 'wordpress', 'ghost'],
    keywords: ['blog', 'article', 'post', 'writing', 'author', 'story', 'news']
  },
  design: {
    name: 'Design',
    color: '#be185d',
    icon: '🎨',
    patterns: ['figma', 'dribbble', 'behance', 'design', 'ui', 'ux'],
    keywords: ['design', 'ui', 'ux', 'prototype', 'wireframe', 'mockup', 'creative']
  },
  productivity: {
    name: 'Productivity',
    color: '#65a30d',
    icon: '⚡',
    patterns: ['notion', 'airtable', 'slack', 'trello', 'asana', 'calendar'],
    keywords: ['productivity', 'workflow', 'task', 'project', 'management', 'organize', 'todo']
  },
  search: {
    name: 'Search',
    color: '#4338ca',
    icon: '🔍',
    patterns: ['google', 'bing', 'duckduckgo', 'search'],
    keywords: ['search', 'find', 'query', 'results']
  },
  news: {
    name: 'News',
    color: '#b91c1c',
    icon: '📰',
    patterns: ['news', 'bbc', 'cnn', 'reuters', 'techcrunch'],
    keywords: ['news', 'article', 'breaking', 'report', 'journalist', 'media']
  }
};

export const detectCategory = (url: string, title: string): CategoryInfo | null => {
  const combinedText = `${url} ${title}`.toLowerCase();
  
  // Check each category for pattern and keyword matches
  for (const [key, category] of Object.entries(CATEGORIES)) {
    // Check URL patterns
    const hasPattern = category.patterns.some(pattern => 
      combinedText.includes(pattern.toLowerCase())
    );
    
    // Check keywords in title and URL
    const hasKeyword = category.keywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (hasPattern || hasKeyword) {
      return category;
    }
  }
  
  return null;
};

export const getCategoryByName = (categoryName: string): CategoryInfo | null => {
  return CATEGORIES[categoryName] || null;
};
