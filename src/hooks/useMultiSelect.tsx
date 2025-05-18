
import { useState, useCallback } from 'react';

// Generic type for items with ID
interface Identifiable {
  id: string;
}

export function useMultiSelect<T extends Identifiable>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  
  // Toggle selection of a single item
  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
    setLastSelectedId(id);
  }, []);
  
  // Handle item selection with support for Shift key (range selection)
  const handleSelectItem = useCallback((id: string, isMultiSelect: boolean, items: T[]) => {
    // If not multi-select mode and not holding modifier key, clear selection and select just this item
    if (!isMultiSelect && !isMultiSelectActive) {
      setSelectedItems(new Set([id]));
      setLastSelectedId(id);
      return;
    }
    
    // For normal toggling (with Ctrl/Cmd key)
    if (isMultiSelect && !isMultiSelectActive) {
      toggleItemSelection(id);
      return;
    }
    
    // If Shift key is pressed and we have a previous selection
    if (isMultiSelect && isMultiSelectActive && lastSelectedId) {
      const itemIds = items.map(item => item.id);
      const currentIndex = itemIds.indexOf(id);
      const lastIndex = itemIds.indexOf(lastSelectedId);
      
      if (currentIndex >= 0 && lastIndex >= 0) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        
        const rangeIds = itemIds.slice(start, end + 1);
        setSelectedItems(prev => {
          const newSelection = new Set(prev);
          rangeIds.forEach(id => newSelection.add(id));
          return newSelection;
        });
        setLastSelectedId(id);
      }
    }
  }, [lastSelectedId, isMultiSelectActive, toggleItemSelection]);
  
  // Start multi-select mode
  const startMultiSelect = useCallback(() => {
    setIsMultiSelectActive(true);
  }, []);
  
  // End multi-select mode
  const endMultiSelect = useCallback(() => {
    setIsMultiSelectActive(false);
  }, []);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedId(null);
  }, []);
  
  // Check if an item is selected
  const isItemSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);
  
  // Get array of selected item IDs
  const getSelectedIds = useCallback((): string[] => {
    return Array.from(selectedItems);
  }, [selectedItems]);
  
  // Check if any item is selected
  const hasSelection = useCallback((): boolean => {
    return selectedItems.size > 0;
  }, [selectedItems]);
  
  return {
    selectedItems: getSelectedIds(),
    hasSelection,
    isMultiSelectActive,
    isItemSelected,
    handleSelectItem,
    startMultiSelect,
    endMultiSelect,
    clearSelection,
    toggleItemSelection
  };
}
