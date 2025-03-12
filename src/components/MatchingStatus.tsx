
import React from 'react';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';

const MatchingStatus: React.FC = () => {
  const { isSearching, isConnected } = useChatContext();

  return (
    <div className="glass-card p-4 relative">
      <h3 className="text-lg font-medium mb-2">
        {isConnected 
          ? 'Chat Connected' 
          : isSearching 
            ? 'Finding a Match...' 
            : 'Start a New Chat'}
      </h3>
      
      {isSearching && (
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse-slow"></div>
          </div>
          <p className="text-sm">Searching for a random person to chat with...</p>
        </div>
      )}
      
      {isConnected && (
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-sm">You're now chatting with a random stranger!</p>
        </div>
      )}
      
      {!isSearching && !isConnected && (
        <p className="text-sm text-foreground/70">
          Click the Connect button to start a random video chat
        </p>
      )}
    </div>
  );
};

export default MatchingStatus;
