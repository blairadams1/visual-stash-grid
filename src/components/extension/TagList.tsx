
import { Badge } from '@/components/ui/badge';

interface TagListProps {
  tags: string[];
  currentTags: string[];
  onTagClick: (tag: string) => void;
  variant?: 'popular' | 'selected';
}

const TagList = ({ 
  tags, 
  currentTags, 
  onTagClick,
  variant = 'popular'
}: TagListProps) => {
  if (tags.length === 0) return null;
  
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {variant === 'popular' ? 'Popular Tags' : 'Selected Tags'}
      </label>
      <div className="flex flex-wrap gap-1">
        {tags.map(tag => {
          const isSelected = currentTags.includes(tag);
          return (
            <Badge 
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer ${
                isSelected 
                  ? "bg-bookmark-blue text-white" 
                  : "border-bookmark-blue text-bookmark-darkBlue hover:bg-bookmark-softBlue"
              }`}
              onClick={() => onTagClick(tag)}
            >
              {tag} {isSelected && "×"}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default TagList;
