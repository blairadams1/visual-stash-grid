
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react';

interface CardSizeSelectorProps {
  currentCardSize: 'small' | 'medium' | 'large';
  onChangeCardSize: (size: 'small' | 'medium' | 'large') => void;
}

const CardSizeSelector: React.FC<CardSizeSelectorProps> = ({ 
  currentCardSize, 
  onChangeCardSize 
}) => {
  return (
    <>
      <DropdownMenuLabel className="px-2 pt-2 text-xs font-normal text-muted-foreground">Card Size</DropdownMenuLabel>
      <div className="flex items-center justify-between px-2 pb-2">
        <Button 
          variant={currentCardSize === 'small' ? 'default' : 'outline'} 
          size="sm"
          className="w-[31%]"
          onClick={() => onChangeCardSize('small')}
        >
          <Grid3X3 className="mr-1 h-3 w-3" />
          S
        </Button>
        <Button 
          variant={currentCardSize === 'medium' ? 'default' : 'outline'}
          size="sm"
          className="w-[31%]"
          onClick={() => onChangeCardSize('medium')}
        >
          <Grid2X2 className="mr-1 h-3 w-3" />
          M
        </Button>
        <Button 
          variant={currentCardSize === 'large' ? 'default' : 'outline'}
          size="sm"
          className="w-[31%]"
          onClick={() => onChangeCardSize('large')}
        >
          <LayoutGrid className="mr-1 h-3 w-3" />
          L
        </Button>
      </div>
    </>
  );
};

export default CardSizeSelector;
