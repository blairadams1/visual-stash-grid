
export const createDefaultThumbnail = (title: string) => {
  const colors = [
    '#4285F4', // blue
    '#34A853', // green
    '#FBBC05', // yellow
    '#EA4335', // red
    '#8AB4F8', // light blue
    '#4CAF50', // medium green
    '#FFA000', // orange
    '#DB4437', // dark red
    '#673AB7', // purple
    '#FF5722', // deep orange
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];

  const initials = title.split(' ').map((word) => word[0]).join('').toUpperCase().substring(0, 2);

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='${color.replace('#', '%23')}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='120' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

const createScaledFavicon = (domain: string) => {
  const totalSize = 400;
  
  // Card height is 208px (h-52), so favicon should be half of that = 104px
  // Scale this to the 400px SVG container: (104/208) * 400 = 200px
  const faviconSize = 200;
  const faviconX = (totalSize - faviconSize) / 2;
  const faviconY = (totalSize - faviconSize) / 2;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${totalSize}' height='${totalSize}' viewBox='0 0 ${totalSize} ${totalSize}'%3E%3Crect width='${totalSize}' height='${totalSize}' fill='%23f8fafc'/%3E%3Cimage x='${faviconX}' y='${faviconY}' width='${faviconSize}' height='${faviconSize}' href='https://www.google.com/s2/favicons?domain=${domain}%26sz=128' preserveAspectRatio='xMidYMid meet'/%3E%3C/svg%3E`;
};

export const generateThumbnail = (url: string, title: string) => {
  try {
    const domain = new URL(url).hostname;
    return createScaledFavicon(domain);
  } catch (error) {
    console.error("Failed to create favicon thumbnail, falling back to default", error);
    return createDefaultThumbnail(title);
  }
};
