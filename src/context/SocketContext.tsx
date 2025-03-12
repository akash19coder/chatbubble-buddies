
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/use-toast';

// Define server URL - in production this should be your deployed server
const SERVER_URL = 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io(SERVER_URL);
    setSocket(socketConnection);

    // Socket event listeners
    const onConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
      toast({
        title: 'Connection lost',
        description: 'You have been disconnected from the server.',
        variant: 'destructive'
      });
    };

    const onConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to the server. Please try again later.',
        variant: 'destructive'
      });
    };

    // Add event listeners
    socketConnection.on('connect', onConnect);
    socketConnection.on('disconnect', onDisconnect);
    socketConnection.on('connect_error', onConnectError);

    // Cleanup on unmount
    return () => {
      socketConnection.off('connect', onConnect);
      socketConnection.off('disconnect', onDisconnect);
      socketConnection.off('connect_error', onConnectError);
      socketConnection.disconnect();
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
