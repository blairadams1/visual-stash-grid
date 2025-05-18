
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import TagSelector from '@/components/TagSelector';
import { Folder } from '@/lib/bookmarkUtils';

interface FolderFormProps {
  initialFolder?: Partial<Folder>;
  onSubmit: (folder: Partial<Folder>) => void;
  submitLabel?: string;
  onCancel?: () => void;
}

const FolderForm: React.FC<FolderFormProps> = ({
  initialFolder = {},
  onSubmit,
  submitLabel = 'Create',
  onCancel
}) => {
  const [name, setName] = useState(initialFolder.name || '');
  const [image, setImage] = useState(initialFolder.image || '/lovable-uploads/80ac03c8-9e22-4604-a202-1c5c73c568eb.png');
  const [tags, setTags] = useState<string[]>(initialFolder.tags || []);
  const [customImage, setCustomImage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Function to validate the form
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Folder name is required';
    }
    
    if (!image) {
      newErrors.image = 'Folder image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        name,
        image,
        tags,
      });
      
      // Reset form if it's a new folder
      if (!initialFolder.id) {
        setName('');
        setImage('/lovable-uploads/80ac03c8-9e22-4604-a202-1c5c73c568eb.png');
        setTags([]);
        setCustomImage('');
      }
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Handle tag removal
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Handle custom image URL input
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomImage(e.target.value);
  };

  // Apply custom image URL
  const applyCustomImage = () => {
    if (customImage) {
      setImage(customImage);
      setCustomImage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Folder Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Folder"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <Label>Folder Image</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md p-4">
            <img 
              src={image} 
              alt="Folder preview" 
              className="h-20 w-20 object-contain"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              value={customImage}
              onChange={handleCustomImageChange}
              placeholder="Image URL"
            />
            <Button 
              type="button" 
              variant="secondary" 
              onClick={applyCustomImage}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags</Label>
        <TagSelector 
          selectedTags={tags}
          onTagSelect={handleTagSelect}
          onTagRemove={handleTagRemove}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-bookmark-blue hover:bg-bookmark-darkBlue">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default FolderForm;
