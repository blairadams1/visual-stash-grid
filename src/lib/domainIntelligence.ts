
// Domain intelligence system for recognizing popular websites and their visual characteristics
export interface DomainInfo {
  name: string;
  category: string;
  primaryColor: string;
  secondaryColor?: string;
  icon: string;
  layout: 'logo' | 'text' | 'icon' | 'combined';
}

export const DOMAIN_INTELLIGENCE: Record<string, DomainInfo> = {
  // Development & Tech
  'github.com': { name: 'GitHub', category: 'development', primaryColor: '#181717', secondaryColor: '#f6f8fa', icon: '⚡', layout: 'logo' },
  'stackoverflow.com': { name: 'Stack Overflow', category: 'development', primaryColor: '#f48024', secondaryColor: '#0077cc', icon: '📚', layout: 'text' },
  'gitlab.com': { name: 'GitLab', category: 'development', primaryColor: '#fc6d26', secondaryColor: '#6b4fbb', icon: '🦊', layout: 'logo' },
  'codepen.io': { name: 'CodePen', category: 'development', primaryColor: '#000000', secondaryColor: '#47cf73', icon: '✒️', layout: 'icon' },
  'dev.to': { name: 'DEV', category: 'development', primaryColor: '#000000', secondaryColor: '#3b49df', icon: '👩‍💻', layout: 'text' },
  'npmjs.com': { name: 'npm', category: 'development', primaryColor: '#cb3837', secondaryColor: '#ffffff', icon: '📦', layout: 'text' },
  
  // Documentation
  'docs.microsoft.com': { name: 'Microsoft Docs', category: 'documentation', primaryColor: '#0078d4', secondaryColor: '#ffffff', icon: '📘', layout: 'combined' },
  'developer.mozilla.org': { name: 'MDN', category: 'documentation', primaryColor: '#000000', secondaryColor: '#ffffff', icon: '🌐', layout: 'text' },
  'w3schools.com': { name: 'W3Schools', category: 'documentation', primaryColor: '#04aa6d', secondaryColor: '#ffffff', icon: '🎓', layout: 'text' },
  
  // Social Media
  'twitter.com': { name: 'Twitter', category: 'social', primaryColor: '#1da1f2', secondaryColor: '#ffffff', icon: '🐦', layout: 'logo' },
  'x.com': { name: 'X', category: 'social', primaryColor: '#000000', secondaryColor: '#ffffff', icon: '❌', layout: 'logo' },
  'linkedin.com': { name: 'LinkedIn', category: 'social', primaryColor: '#0077b5', secondaryColor: '#ffffff', icon: '💼', layout: 'logo' },
  'facebook.com': { name: 'Facebook', category: 'social', primaryColor: '#1877f2', secondaryColor: '#ffffff', icon: '👥', layout: 'logo' },
  'instagram.com': { name: 'Instagram', category: 'social', primaryColor: '#e4405f', secondaryColor: '#ffffff', icon: '📸', layout: 'logo' },
  'reddit.com': { name: 'Reddit', category: 'social', primaryColor: '#ff4500', secondaryColor: '#ffffff', icon: '🤖', layout: 'logo' },
  
  // Video & Media
  'youtube.com': { name: 'YouTube', category: 'video', primaryColor: '#ff0000', secondaryColor: '#ffffff', icon: '📺', layout: 'logo' },
  'vimeo.com': { name: 'Vimeo', category: 'video', primaryColor: '#1ab7ea', secondaryColor: '#ffffff', icon: '🎬', layout: 'logo' },
  'twitch.tv': { name: 'Twitch', category: 'video', primaryColor: '#9146ff', secondaryColor: '#ffffff', icon: '🎮', layout: 'logo' },
  
  // E-commerce
  'amazon.com': { name: 'Amazon', category: 'shopping', primaryColor: '#ff9900', secondaryColor: '#232f3e', icon: '📦', layout: 'logo' },
  'ebay.com': { name: 'eBay', category: 'shopping', primaryColor: '#0064d2', secondaryColor: '#f5af02', icon: '🛒', layout: 'text' },
  'etsy.com': { name: 'Etsy', category: 'shopping', primaryColor: '#f56400', secondaryColor: '#ffffff', icon: '🎨', layout: 'text' },
  
  // News & Blogs
  'medium.com': { name: 'Medium', category: 'blog', primaryColor: '#000000', secondaryColor: '#ffffff', icon: '✍️', layout: 'text' },
  'substack.com': { name: 'Substack', category: 'blog', primaryColor: '#ff6719', secondaryColor: '#ffffff', icon: '📰', layout: 'text' },
  'hashnode.com': { name: 'Hashnode', category: 'blog', primaryColor: '#2962ff', secondaryColor: '#ffffff', icon: '#️⃣', layout: 'logo' },
  
  // Design & Creative
  'figma.com': { name: 'Figma', category: 'design', primaryColor: '#f24e1e', secondaryColor: '#ffffff', icon: '🎨', layout: 'logo' },
  'dribbble.com': { name: 'Dribbble', category: 'design', primaryColor: '#ea4c89', secondaryColor: '#ffffff', icon: '🏀', layout: 'logo' },
  'behance.net': { name: 'Behance', category: 'design', primaryColor: '#1769ff', secondaryColor: '#ffffff', icon: '🎭', layout: 'logo' },
  
  // Cloud & Tools
  'notion.so': { name: 'Notion', category: 'productivity', primaryColor: '#000000', secondaryColor: '#ffffff', icon: '📝', layout: 'logo' },
  'airtable.com': { name: 'Airtable', category: 'productivity', primaryColor: '#18bfff', secondaryColor: '#ffffff', icon: '📊', layout: 'logo' },
  'slack.com': { name: 'Slack', category: 'productivity', primaryColor: '#4a154b', secondaryColor: '#ffffff', icon: '💬', layout: 'logo' },
  'discord.com': { name: 'Discord', category: 'social', primaryColor: '#5865f2', secondaryColor: '#ffffff', icon: '🎮', layout: 'logo' },
  
  // Google Services
  'google.com': { name: 'Google', category: 'search', primaryColor: '#4285f4', secondaryColor: '#ea4335', icon: '🔍', layout: 'logo' },
  'gmail.com': { name: 'Gmail', category: 'productivity', primaryColor: '#ea4335', secondaryColor: '#ffffff', icon: '📧', layout: 'logo' },
  'drive.google.com': { name: 'Google Drive', category: 'productivity', primaryColor: '#4285f4', secondaryColor: '#0f9d58', icon: '☁️', layout: 'logo' },
  'docs.google.com': { name: 'Google Docs', category: 'productivity', primaryColor: '#4285f4', secondaryColor: '#ffffff', icon: '📄', layout: 'logo' },
};

export const getDomainInfo = (domain: string): DomainInfo | null => {
  // Remove www. prefix and get the main domain
  const cleanDomain = domain.replace(/^www\./, '');
  return DOMAIN_INTELLIGENCE[cleanDomain] || null;
};

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};
