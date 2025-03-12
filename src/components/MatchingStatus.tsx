
import React from 'react';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';

const MatchingStatus: React.FC = () => {
  const { isSearching, isConnected } = useChatContext();
  const { isConnected: socketConnected } = useSocket();

  return (
    <div className="glass-card p-4 relative">
      <h3 className="text-lg font-medium mb-2">
        {isConnected 
          ? 'Chat Connected' 
          : isSearching 
            ? 'Finding a Match...' 
            : 'Start a New Chat'}
      </h3>
      
      {!socketConnected && (
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-red-500 rounded-full"></div>
          </div>
          <p className="text-sm text-red-500">Disconnected from server</p>
        </div>
      )}
      
      {socketConnected && isSearching && (
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse-slow"></div>
          </div>
          <p className="text-sm">Searching for a random person to chat with...</p>
        </div>
      )}
      
      {socketConnected && isConnected && (
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-sm">You're now chatting with a random stranger!</p>
        </div>
      )}
      
      {socketConnected && !isSearching && !isConnected && (
        <p className="text-sm text-foreground/70">
          Click the Connect button to start a random video chat
        </p>
      )}
      
      <div className="mt-3 pt-3 border-t border-border/40">
        <h4 className="text-sm font-medium mb-1">Server Status</h4>
        <div className="flex items-center gap-2">
          <div className="relative w-3 h-3">
            <div className={cn(
              "absolute inset-0 rounded-full",
              socketConnected ? "bg-green-500" : "bg-red-500"
            )}></div>
          </div>
          <p className="text-xs">
            {socketConnected 
              ? "Connected to server" 
              : "Disconnected - check your connection"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchingStatus;
