
import { useState, useEffect, useCallback } from 'react';
import { 
  Tag, 
  TagCategory, 
  getDefaultTagCategories, 
  createTag, 
  createTagCategory 
} from '@/lib/bookmarkUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useTags() {
  // State for tags and categories from local storage
  const [tags, setTags] = useLocalStorage<Tag[]>("tags", []);
  const [categories, setCategories] = useLocalStorage<TagCategory[]>("tagCategories", []);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize with default categories if none exist
  useEffect(() => {
    if (categories.length === 0) {
      const defaultCategories = getDefaultTagCategories();
      setCategories(defaultCategories);
    }
    setLoading(false);
  }, []);
  
  // Add a new tag
  const addTag = useCallback((name: string, categoryId?: string, color?: string, parentTagId?: string) => {
    const newTag = createTag(name, categoryId, color, parentTagId);
    setTags([...tags, newTag]);
    return newTag;
  }, [tags, setTags]);
  
  // Add a new category
  const addCategory = useCallback((name: string, color: string) => {
    const newCategory = createTagCategory(name, color);
    setCategories([...categories, newCategory]);
    return newCategory;
  }, [categories, setCategories]);
  
  // Update a tag
  const updateTag = useCallback((id: string, updates: Partial<Tag>) => {
    setTags(prevTags => 
      prevTags.map(tag => 
        tag.id === id ? { ...tag, ...updates } : tag
      )
    );
  }, [setTags]);
  
  // Update a category
  const updateCategory = useCallback((id: string, updates: Partial<TagCategory>) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === id ? { ...category, ...updates } : category
      )
    );
  }, [setCategories]);
  
  // Delete a tag
  const deleteTag = useCallback((id: string) => {
    setTags(prevTags => 
      prevTags.filter(tag => tag.id !== id)
    );
  }, [setTags]);
  
  // Delete a category
  const deleteCategory = useCallback((id: string) => {
    setCategories(prevCategories => 
      prevCategories.filter(category => category.id !== id)
    );
    
    // Update any tags with this category ID to remove the categoryId
    setTags(prevTags =>
      prevTags.map(tag =>
        tag.categoryId === id ? { ...tag, categoryId: undefined } : tag
      )
    );
  }, [setTags, setCategories]);
  
  // Get tags by category
  const getTagsByCategory = useCallback((categoryId: string) => {
    return tags.filter(tag => tag.categoryId === categoryId);
  }, [tags]);
  
  // Get child tags by parent tag
  const getChildTags = useCallback((parentTagId: string) => {
    return tags.filter(tag => tag.parentTagId === parentTagId);
  }, [tags]);
  
  // Get category by ID
  const getCategoryById = useCallback((id: string) => {
    return categories.find(category => category.id === id);
  }, [categories]);
  
  // Get tag by name
  const getTagByName = useCallback((name: string) => {
    return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
  }, [tags]);
  
  return {
    tags,
    categories,
    loading,
    addTag,
    addCategory,
    updateTag,
    updateCategory,
    deleteTag,
    deleteCategory,
    getTagsByCategory,
    getChildTags,
    getCategoryById,
    getTagByName
  };
}
