
// Layout utility functions for BookmarkGrid

export const getColumnClasses = (layout: 'grid' | 'list' | 'compact', cardSize: string) => {
  if (layout === 'list') return 'grid-cols-1';
  
  switch (cardSize) {
    case 'small':
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';
    case 'large':
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'; // Allow 3 columns on larger screens
    default: // medium
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  }
};

// Updated height classes with better proportions
export const getCardHeightClasses = (cardSize: string) => {
  switch (cardSize) {
    case 'small':
      return 'h-36'; // Slightly increased from h-32
    case 'large':
      return 'h-72'; // Reduced from h-80 for better proportions
    default: // medium
      return 'h-44'; // Slightly increased from h-40
  }
};

// Get consistent aspect ratio for all cards
export const getCardAspectRatio = (cardSize: string) => {
  // Use the same consistent aspect ratio for all card sizes
  return 'aspect-[3/2]';
};
