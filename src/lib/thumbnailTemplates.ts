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
  
  // Extract properties based on the type of info object
  let primaryColor: string;
  let secondaryColor: string;
  let icon: string;
  let layout: string | undefined;
  let name: string;
  
  if ('primaryColor' in domainInfo!) {
    // It's a DomainInfo object
    primaryColor = domainInfo!.primaryColor;
    secondaryColor = domainInfo!.secondaryColor || '#ffffff';
    icon = domainInfo!.icon;
    layout = domainInfo!.layout;
    name = domainInfo!.name;
  } else if ('color' in categoryInfo!) {
    // It's a CategoryInfo object
    primaryColor = categoryInfo!.color;
    secondaryColor = '#ffffff';
    icon = categoryInfo!.icon;
    layout = 'icon'; // Default layout for categories
    name = categoryInfo!.name;
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
  
  // Create a more polished globe icon with better styling
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad${width}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(color)};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23000000;stop-opacity:0.2' /%3E%3C/linearGradient%3E%3ClinearGradient id='iconGrad${width}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffffff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f0f0f0;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='${width}' height='${height}' fill='url(%23grad${width})' rx='${borderRadius}' /%3E%3Cg transform='translate(${(width-48)/2}, ${(height-48)/2})'%3E%3Ccircle cx='24' cy='24' r='22' fill='url(%23iconGrad${width})' stroke='rgba(255,255,255,0.3)' stroke-width='1'/%3E%3Cpath d='M24 4C13.5 4 5 12.5 5 23s8.5 19 19 19 19-8.5 19-19S34.5 4 24 4zm-2 33.93c-6.91-1.04-12.25-6.74-12.25-13.93 0-1.09.12-2.14.37-3.14L15 25v2c0 1.93 1.57 3.5 3.5 3.5v2.43zm12.07-4.46c-.46-1.42-1.75-2.47-3.32-2.47h-1.75v-5.25c0-.97-.78-1.75-1.75-1.75H14v-3.5h3.5c.97 0 1.75-.78 1.75-1.75V12.25h3.5c1.93 0 3.5-1.57 3.5-3.5v-.72c5.12 2.08 8.75 7.11 8.75 12.97 0 3.64-1.4 6.95-3.68 9.43z' fill='${encodeURIComponent(color)}'/%3E%3C/g%3E%3C/svg%3E`;
};

export const generateCategoryThumbnail = (
  categoryInfo: CategoryInfo,
  domain: string,
  options: ThumbnailOptions = {}
): string => {
  const { color, icon, name } = categoryInfo;
  
  return generateIconTemplate(name, color, '#ffffff', icon, options);
};
