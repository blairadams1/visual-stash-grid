
import { ReactNode } from 'react';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  tags: string[];
  order: number;
  dateAdded: string;
  notes?: string;
  collectionId?: string;
  folderId?: string;
  createdAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  parentId?: string;
}

export interface Folder {
  id: string;
  name: string;
  image: string;
  tags: string[];
  order: number;
  dateAdded: string;
  collectionId?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  categoryId?: string;
  color?: string;
  parentTagId?: string;
}

export interface TagCategory {
  id: string;
  name: string;
  color: string;
}
