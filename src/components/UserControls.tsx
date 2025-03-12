
import React from 'react';
import { useChatContext } from '@/context/ChatContext';
import Button from './Button';
import { cn } from '@/lib/utils';

const UserControls: React.FC = () => {
  const { 
    isSearching, 
    isConnected, 
    startSearching, 
    stopSearching, 
    skipUser 
  } = useChatContext();

  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
      <div>
        <h3 className="text-lg font-medium">Status: 
          <span 
            className={cn(
              'ml-2 text-base',
              isConnected 
                ? 'text-green-500' 
                : isSearching 
                  ? 'text-amber-500' 
                  : 'text-foreground/60'
            )}
          >
            {isConnected 
              ? 'Connected' 
              : isSearching 
                ? 'Searching...' 
                : 'Disconnected'}
          </span>
        </h3>
      </div>
      
      <div className="flex gap-3">
        {!isSearching && !isConnected && (
          <Button 
            onClick={startSearching}
            className="shadow-sm"
          >
            Connect
          </Button>
        )}
        
        {isSearching && (
          <Button 
            variant="outline" 
            onClick={stopSearching}
          >
            Cancel
          </Button>
        )}
        
        {isConnected && (
          <Button 
            onClick={skipUser}
            className="shadow-sm"
          >
            Next Person
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserControls;
