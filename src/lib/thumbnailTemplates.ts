// SVG thumbnail template system for generating domain-appropriate thumbnails
import { DomainInfo } from './domainIntelligence';
import { CategoryInfo } from './categoryDetection';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  borderRadius?: number;
}

// Professional icon options for different types of content
const PROFESSIONAL_ICONS = [
  // Tech/Development
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'/%3E%3C/svg%3E`,
  // Document/Content
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'/%3E%3C/svg%3E`,
  // Search/Database
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z'/%3E%3C/svg%3E`,
  // Cloud/Network
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04Z'/%3E%3C/svg%3E`,
  // Tools/Settings
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z'/%3E%3C/svg%3E`,
  // Chart/Analytics
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z'/%3E%3C/svg%3E`,
  // Globe/Website
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E`,
  // Book/Education
  `%3Csvg width='48' height='48' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.68 6.5,20.68C8.45,20.68 10.55,21.1 12,22C13.35,21.15 15.8,20.68 17.5,20.68C19.15,20.68 20.85,20.95 22.25,21.58C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,18.9 12,19.5C10.65,18.9 8.2,18.5 6.5,18.5C5.05,18.5 3.1,18.65 1.75,19.25V8.5C3.1,7.65 5.05,7.5 6.5,7.5C8.2,7.5 10.65,7.85 12,8.5C13.35,7.85 15.8,7.5 17.5,7.5C18.7,7.5 19.9,7.65 21,8V6.5C19.55,5.4 17.45,5 15.5,5C13.8,5 11.35,5.4 10,6.5C8.65,5.4 6.2,5 4.5,5H6.5Z'/%3E%3C/svg%3E`
];

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
  
  // Extract properties based on the type of info object
  let primaryColor: string;
  let secondaryColor: string;
  let icon: string;
  let layout: string | undefined;
  let name: string;
  
  if ('primaryColor' in info) {
    // It's a DomainInfo object
    primaryColor = info.primaryColor;
    secondaryColor = info.secondaryColor || '#ffffff';
    icon = info.icon;
    layout = info.layout;
    name = info.name;
  } else if ('color' in info) {
    // It's a CategoryInfo object
    primaryColor = info.color;
    secondaryColor = '#ffffff';
    icon = info.icon;
    layout = 'icon'; // Default layout for categories
    name = info.name;
  } else {
    // Fallback
    return generateDefaultThumbnail(domain, title, options);
  }
  
  const displayName = domainInfo ? domainInfo.name : name;
  
  switch (layout) {
    case 'logo':
      return generateLogoTemplate(displayName, primaryColor, secondaryColor, icon, options);
    case 'text':
      return generateTextTemplate(displayName, primaryColor, secondaryColor, icon, options);
    case 'icon':
      return generateIconTemplate(displayName, primaryColor, secondaryColor, icon, options);
    case 'combined':
      return generateCombinedTemplate(displayName, primaryColor, secondaryColor, icon, options);
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
  
  // Select a professional icon based on domain hash
  const iconIndex = Math.abs(domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % PROFESSIONAL_ICONS.length;
  const professionalIcon = PROFESSIONAL_ICONS[iconIndex];
  
  // Create a modern website thumbnail with professional icons
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad${width}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(color)};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23000000;stop-opacity:0.15' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='${width}' height='${height}' fill='url(%23grad${width})' rx='${borderRadius}' /%3E%3Cg transform='translate(${width/2 - 24}, ${height/2 - 24})'%3E${professionalIcon}%3C/g%3E%3C/svg%3E`;
};

export const generateCategoryThumbnail = (
  categoryInfo: CategoryInfo,
  domain: string,
  options: ThumbnailOptions = {}
): string => {
  const { color, icon, name } = categoryInfo;
  
  return generateIconTemplate(name, color, '#ffffff', icon, options);
};

// Create a favicon with proper scaling and 70px padding on all sides
export const createScaledFavicon = (faviconUrl: string, scale: number = 0.11): string => {
  const size = 120;
  const padding = 70;
  const iconSize = Math.round((size - padding * 2) * scale);
  const offset = Math.round((size - iconSize) / 2);
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='%23f8f9fa' rx='8' /%3E%3Cimage x='${offset}' y='${offset}' width='${iconSize}' height='${iconSize}' href='${encodeURIComponent(faviconUrl)}' style='image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;' /%3E%3C/svg%3E`;
};
