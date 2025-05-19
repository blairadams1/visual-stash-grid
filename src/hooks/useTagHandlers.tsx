
import { useCallback } from 'react';

/**
 * Hook for tag-related operations
 */
export const useTagHandlers = (
  selectedTags: string[],
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Handle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
      // Only add if not already there
      if (!prev.includes(tag)) {
        return [...prev, tag];
      }
      return prev;
    });
    // Close the filter sheet after tag selection for better UX
    setIsFilterOpen(false);
  }, [setSelectedTags, setIsFilterOpen]);

  // Handle tag deselection
  const handleTagDeselect = useCallback((tag: string) => {
    setSelectedTags(prev => prev.filter((t) => t !== tag));
  }, [setSelectedTags]);

  // Handle clearing all tags
  const handleClearAllTags = useCallback(() => {
    setSelectedTags([]);
  }, [setSelectedTags]);

  return {
    handleTagSelect,
    handleTagDeselect,
    handleClearAllTags
  };
};
