
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sun, Moon } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark';
  onChangeTheme: (theme: 'light' | 'dark') => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onChangeTheme }) => {
  return (
    <>
      <DropdownMenuLabel className="px-2 pt-2 text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
      <div className="flex items-center justify-between px-2 pb-2">
        <Button 
          variant={currentTheme === 'light' ? 'default' : 'outline'} 
          size="sm"
          className="w-[48%]"
          onClick={() => onChangeTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button 
          variant={currentTheme === 'dark' ? 'default' : 'outline'} 
          size="sm"
          className="w-[48%]"
          onClick={() => onChangeTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </Button>
      </div>
    </>
  );
};

export default ThemeSelector;
