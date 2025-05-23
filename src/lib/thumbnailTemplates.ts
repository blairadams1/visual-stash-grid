
// SVG thumbnail template system for generating domain-appropriate thumbnails
import { DomainInfo } from './domainIntelligence';
import { CategoryInfo } from './categoryDetection';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  borderRadius?: number;
}

// Diverse avatar options
const DIVERSE_AVATARS = [
  '👨🏻‍💻', // Light skin man
  '👩🏻‍💻', // Light skin woman
  '👨🏽‍💻', // Medium skin man
  '👩🏽‍💻', // Medium skin woman
  '👨🏿‍💻', // Dark skin man
  '👩🏿‍💻', // Dark skin woman
  '👨🏼‍💻', // Medium-light skin man
  '👩🏼‍💻', // Medium-light skin woman
  '👨🏾‍💻', // Medium-dark skin man
  '👩🏾‍💻', // Medium-dark skin woman
  '🧑🏻‍💻', // Light skin person
  '🧑🏽‍💻', // Medium skin person
  '🧑🏿‍💻', // Dark skin person
  '🧑🏼‍💻', // Medium-light skin person
  '🧑🏾‍💻', // Medium-dark skin person
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
  
  // Select a diverse avatar based on domain hash
  const avatarIndex = Math.abs(domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % DIVERSE_AVATARS.length;
  const avatar = DIVERSE_AVATARS[avatarIndex];
  
  // Create a modern, diverse avatar thumbnail
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad${width}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(color)};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23000000;stop-opacity:0.15' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='${width}' height='${height}' fill='url(%23grad${width})' rx='${borderRadius}' /%3E%3Ctext x='50%25' y='50%25' font-family='Apple Color Emoji, Segoe UI Emoji, sans-serif' font-size='42' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(avatar)}%3C/text%3E%3C/svg%3E`;
};

export const generateCategoryThumbnail = (
  categoryInfo: CategoryInfo,
  domain: string,
  options: ThumbnailOptions = {}
): string => {
  const { color, icon, name } = categoryInfo;
  
  return generateIconTemplate(name, color, '#ffffff', icon, options);
};

// Create a favicon with proper scaling to reduce pixelation
export const createScaledFavicon = (faviconUrl: string, scale: number = 0.33): string => {
  const size = 120;
  const iconSize = Math.round(size * scale);
  const offset = Math.round((size - iconSize) / 2);
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='%23f8f9fa' rx='8' /%3E%3Cimage x='${offset}' y='${offset}' width='${iconSize}' height='${iconSize}' href='${encodeURIComponent(faviconUrl)}' style='image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;' /%3E%3C/svg%3E`;
};
