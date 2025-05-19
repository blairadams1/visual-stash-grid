
import { Collection, TagCategory } from './types';
import { createCollection } from './createUtils';

// Default generators
export const getDefaultCollections = (): Collection[] => {
  return [
    createCollection("Work", [], undefined, "Work-related bookmarks", "#FEC6A1"),
    createCollection("Personal", [], undefined, "Personal bookmarks", "#D3E4FD"),
    createCollection("Learning", [], undefined, "Educational resources", "#F2FCE2"),
  ];
};

export const getDefaultTagCategories = (): TagCategory[] => {
  return [
    {
      id: "category-general",
      name: "General",
      color: "#D3E4FD"
    },
    {
      id: "category-tech",
      name: "Technology",
      color: "#E5DEFF"
    },
    {
      id: "category-work",
      name: "Work",
      color: "#FEC6A1"
    },
    {
      id: "category-personal",
      name: "Personal",
      color: "#FFDEE2"
    }
  ];
};
