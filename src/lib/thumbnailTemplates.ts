
// SVG thumbnail template system for generating domain-appropriate thumbnails
import { DomainInfo } from './domainIntelligence';
import { CategoryInfo } from './categoryDetection';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export const generateSVGThumbnail = (
  domain: string,
  title: string,
  domainInfo?: DomainInfo | null,
  categoryInfo?: CategoryInfo | null,
  options: ThumbnailOptions = {}
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  
  // Use domain info if available, fallback to category info
  const info = domainInfo || categoryInfo;
  
  if (!info) {
    return generateDefaultThumbnail(domain, title, options);
  }
  
  const { primaryColor, secondaryColor, icon, layout, name } = info;
  const displayName = domainInfo?.name || name;
  
  switch (layout) {
    case 'logo':
      return generateLogoTemplate(displayName, primaryColor, secondaryColor || '#ffffff', icon, options);
    case 'text':
      return generateTextTemplate(displayName, primaryColor, secondaryColor || '#ffffff', icon, options);
    case 'icon':
      return generateIconTemplate(displayName, primaryColor, secondaryColor || '#ffffff', icon, options);
    case 'combined':
      return generateCombinedTemplate(displayName, primaryColor, secondaryColor || '#ffffff', icon, options);
    default:
      return generateDefaultThumbnail(domain, title, options);
  }
};

const generateLogoTemplate = (
  name: string,
  primaryColor: string,
  secondaryColor: string,
  icon: string,
  options: ThumbnailOptions
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(primaryColor)}' rx='${borderRadius}' /%3E%3Ccircle cx='${width/2}' cy='${height/2 - 10}' r='20' fill='${encodeURIComponent(secondaryColor)}' /%3E%3Ctext x='50%25' y='${height/2 - 5}' font-family='Arial, sans-serif' font-size='20' font-weight='bold' fill='${encodeURIComponent(primaryColor)}' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(icon)}%3C/text%3E%3Ctext x='50%25' y='${height - 15}' font-family='Arial, sans-serif' font-size='10' font-weight='600' fill='${encodeURIComponent(secondaryColor)}' text-anchor='middle'%3E${encodeURIComponent(name.toUpperCase())}%3C/text%3E%3C/svg%3E`;
};

const generateTextTemplate = (
  name: string,
  primaryColor: string,
  secondaryColor: string,
  icon: string,
  options: ThumbnailOptions
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  const shortName = name.length > 8 ? name.substring(0, 8) + '...' : name;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(primaryColor)}' rx='${borderRadius}' /%3E%3Ctext x='50%25' y='${height/2 - 15}' font-family='Arial, sans-serif' font-size='14' font-weight='bold' fill='${encodeURIComponent(secondaryColor)}' text-anchor='middle'%3E${encodeURIComponent(shortName)}%3C/text%3E%3Ctext x='50%25' y='${height/2 + 10}' font-family='Arial, sans-serif' font-size='24' fill='${encodeURIComponent(secondaryColor)}' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(icon)}%3C/text%3E%3C/svg%3E`;
};

const generateIconTemplate = (
  name: string,
  primaryColor: string,
  secondaryColor: string,
  icon: string,
  options: ThumbnailOptions
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(primaryColor)}' rx='${borderRadius}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='42' font-weight='bold' fill='${encodeURIComponent(secondaryColor)}' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(icon)}%3C/text%3E%3C/svg%3E`;
};

const generateCombinedTemplate = (
  name: string,
  primaryColor: string,
  secondaryColor: string,
  icon: string,
  options: ThumbnailOptions
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  const shortName = name.length > 6 ? name.substring(0, 6) : name;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(primaryColor)};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:${encodeURIComponent(secondaryColor)};stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='${width}' height='${height}' fill='url(%23grad)' rx='${borderRadius}' /%3E%3Ctext x='50%25' y='${height/2 - 5}' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(icon)}%3C/text%3E%3Ctext x='50%25' y='${height - 12}' font-family='Arial, sans-serif' font-size='9' font-weight='600' fill='white' text-anchor='middle' opacity='0.9'%3E${encodeURIComponent(shortName.toUpperCase())}%3C/text%3E%3C/svg%3E`;
};

const generateDefaultThumbnail = (
  domain: string,
  title: string,
  options: ThumbnailOptions
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8AB4F8', '#673AB7'];
  const color = colors[Math.abs(domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
  
  const firstLetter = domain.charAt(0).toUpperCase() || title.charAt(0).toUpperCase() || '🔖';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(color)}' rx='${borderRadius}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='42' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(firstLetter)}%3C/text%3E%3C/svg%3E`;
};

export const generateCategoryThumbnail = (
  categoryInfo: CategoryInfo,
  domain: string,
  options: ThumbnailOptions = {}
): string => {
  const { width = 120, height = 120, borderRadius = 8 } = options;
  const { color, icon, name } = categoryInfo;
  
  return generateIconTemplate(name, color, '#ffffff', icon, options);
};
