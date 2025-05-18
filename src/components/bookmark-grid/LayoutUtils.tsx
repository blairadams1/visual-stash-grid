
// Layout utility functions for BookmarkGrid

export const getColumnClasses = (layout: 'grid' | 'list' | 'compact', cardSize: string) => {
  if (layout === 'list') return 'grid-cols-1';
  
  switch (cardSize) {
    case 'small':
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7';
    case 'large':
      return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2';
    default: // medium
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5';
  }
};
