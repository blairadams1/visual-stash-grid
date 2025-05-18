
import React, { ReactNode } from 'react';
import { MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollectionsPanel from '@/components/CollectionsPanel';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar: boolean;
  toggleSidebar: () => void;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;
  theme: 'light' | 'dark';
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar,
  toggleSidebar,
  selectedCollectionId,
  setSelectedCollectionId,
  theme
}) => {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex min-h-screen">
        {/* Collections Sidebar with smooth transition */}
        <div 
          className={`w-64 fixed top-0 left-0 bottom-0 z-40 h-screen p-4 overflow-y-auto transform transition-transform duration-300 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Collections</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleSidebar}
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
          </div>
          <CollectionsPanel 
            selectedCollectionId={selectedCollectionId}
            onSelectCollection={(id) => {
              setSelectedCollectionId(id);
              // On mobile, close the sidebar after selecting a collection
              if (window.innerWidth < 768) {
                toggleSidebar();
              }
            }}
          />
        </div>

        <div className={`flex-1 flex flex-col transition-margin duration-300 ${showSidebar ? 'md:ml-64' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
