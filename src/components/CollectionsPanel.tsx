
import React, { useState } from 'react';
import { Collection } from '@/lib/bookmarkUtils';
import { useCollections } from '@/hooks/useCollections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CollectionsPanelProps {
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null) => void;
}

const CollectionsPanel: React.FC<CollectionsPanelProps> = ({ 
  selectedCollectionId, 
  onSelectCollection 
}) => {
  const { collections, addCollection, updateCollection, deleteCollection } = useCollections();
  const [openCollections, setOpenCollections] = useState<Record<string, boolean>>({});
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const { toast } = useToast();

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setOpenCollections({
      ...openCollections,
      [collectionId]: !openCollections[collectionId]
    });
  };

  // Handle adding a new collection
  const handleAddCollection = (parentId?: string) => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Collection name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    addCollection(newCollectionName, parentId);
    setNewCollectionName('');
    setIsAddingCollection(false);
    toast({
      title: `Collection '${newCollectionName}' created`
    });
  };

  // Handle updating a collection
  const handleUpdateCollection = () => {
    if (!editingCollection || !editingCollection.name.trim()) {
      toast({
        title: "Collection name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    updateCollection(editingCollection.id, {
      name: editingCollection.name,
      description: editingCollection.description,
      color: editingCollection.color
    });
    setEditingCollection(null);
    toast({
      title: `Collection updated`
    });
  };

  // Handle deleting a collection
  const handleDeleteCollection = (collectionId: string) => {
    deleteCollection(collectionId);
    if (selectedCollectionId === collectionId) {
      onSelectCollection(null);
    }
    toast({
      title: "Collection deleted"
    });
  };

  // Root-level collections (those without a parent)
  const rootCollections = collections.filter(c => !c.parentId).sort((a, b) => a.order - b.order);

  // Get child collections for a parent
  const getChildCollections = (parentId: string) => {
    return collections
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Recursive component for nested collections
  const renderCollectionTree = (collection: Collection, level: number = 0) => {
    const childCollections = getChildCollections(collection.id);
    const hasChildren = childCollections.length > 0;
    const isOpen = openCollections[collection.id] || false;

    return (
      <div key={collection.id} className="w-full">
        <div 
          className={cn(
            "flex items-center rounded-md p-2 mb-1 cursor-pointer",
            selectedCollectionId === collection.id 
              ? "bg-bookmark-blue text-white" 
              : "hover:bg-gray-100"
          )}
          style={{ paddingLeft: `${level * 8 + 8}px` }}
        >
          {hasChildren && (
            <button 
              className="mr-1 focus:outline-none"
              onClick={(e) => { 
                e.stopPropagation(); 
                toggleCollection(collection.id); 
              }}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          <div 
            className="flex items-center flex-1"
            onClick={() => onSelectCollection(collection.id)}
          >
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: collection.color || '#D3E4FD' }} 
            />
            <Folder 
              size={16} 
              className="mr-2" 
              style={{ color: selectedCollectionId === collection.id ? 'white' : collection.color || '#D3E4FD' }} 
            />
            <span className="truncate flex-1">{collection.name}</span>
          </div>
          
          <div className="flex ml-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-6 w-6 p-0 opacity-60 hover:opacity-100",
                    selectedCollectionId === collection.id ? "text-white" : "text-gray-600"
                  )}
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Edit size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Collection</DialogTitle>
                  <DialogDescription>
                    Update the collection details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection-name">Name</Label>
                    <Input 
                      id="collection-name" 
                      value={editingCollection?.name || collection.name}
                      onChange={(e) => setEditingCollection({ 
                        ...collection, 
                        name: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collection-description">Description (optional)</Label>
                    <Input 
                      id="collection-description" 
                      value={editingCollection?.description || collection.description || ''}
                      onChange={(e) => setEditingCollection({ 
                        ...collection, 
                        description: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collection-color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="collection-color" 
                        type="color"
                        value={editingCollection?.color || collection.color || '#D3E4FD'}
                        onChange={(e) => setEditingCollection({
                          ...collection,
                          color: e.target.value
                        })}
                        className="w-12 h-8 p-1"
                      />
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: editingCollection?.color || collection.color || '#D3E4FD' }}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      onClick={() => handleUpdateCollection()}
                      className="bg-bookmark-blue hover:bg-bookmark-darkBlue"
                    >
                      Save Changes
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-6 w-6 p-0 opacity-60 hover:opacity-100",
                selectedCollectionId === collection.id ? "text-white" : "text-gray-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
                  handleDeleteCollection(collection.id);
                }
              }}
            >
              <Trash2 size={14} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-6 w-6 p-0 opacity-60 hover:opacity-100",
                selectedCollectionId === collection.id ? "text-white" : "text-gray-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingCollection(true);
              }}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Form to add subcollection */}
        {isAddingCollection && (
          <div className="pl-8 mb-2">
            <div className="flex items-center">
              <Input 
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection name..."
                className="text-sm h-8 mr-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCollection(collection.id);
                  } else if (e.key === 'Escape') {
                    setIsAddingCollection(false);
                    setNewCollectionName('');
                  }
                }}
              />
              <Button 
                size="sm"
                className="h-8 bg-bookmark-blue hover:bg-bookmark-darkBlue"
                onClick={() => handleAddCollection(collection.id)}
              >
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 ml-1"
                onClick={() => {
                  setIsAddingCollection(false);
                  setNewCollectionName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Child collections (if any) */}
        {hasChildren && isOpen && (
          <div className="ml-2">
            {childCollections.map(childCollection => 
              renderCollectionTree(childCollection, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* All bookmarks option */}
      <div 
        className={cn(
          "flex items-center rounded-md p-2 mb-1 cursor-pointer",
          selectedCollectionId === null 
            ? "bg-bookmark-blue text-white" 
            : "hover:bg-gray-100"
        )}
        onClick={() => onSelectCollection(null)}
      >
        <Folder size={16} className="mr-2" />
        <span className="truncate flex-1">All Bookmarks</span>
      </div>
      
      {/* Collections header with add button */}
      <div className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-sm font-medium text-gray-500">COLLECTIONS</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => setIsAddingCollection(true)}
        >
          <FolderPlus size={16} />
        </Button>
      </div>
      
      {/* Form to add top-level collection */}
      {isAddingCollection && (
        <div className="mb-2">
          <div className="flex items-center">
            <Input 
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="New collection name..."
              className="text-sm h-8 mr-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCollection();
                } else if (e.key === 'Escape') {
                  setIsAddingCollection(false);
                  setNewCollectionName('');
                }
              }}
            />
            <Button 
              size="sm"
              className="h-8 bg-bookmark-blue hover:bg-bookmark-darkBlue"
              onClick={() => handleAddCollection()}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 ml-1"
              onClick={() => {
                setIsAddingCollection(false);
                setNewCollectionName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Collection tree */}
      <div className="space-y-1">
        {rootCollections.map(collection => 
          renderCollectionTree(collection)
        )}
      </div>
    </div>
  );
};

export default CollectionsPanel;
