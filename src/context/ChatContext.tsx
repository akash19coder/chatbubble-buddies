
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from './SocketContext';
import { toast as sonnerToast } from 'sonner';

interface User {
  id: string;
  isConnected: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  isSearching: boolean;
  isConnected: boolean;
  messages: Message[];
  currentUser: User;
  remoteUser: User | null;
  startSearching: () => void;
  stopSearching: () => void;
  endChat: () => void;
  sendMessage: (content: string) => void;
  reportUser: () => void;
  skipUser: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Generate a random ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 10);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { socket, isConnected: socketConnected } = useSocket();
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({ id: '', isConnected: false });
  const [remoteUser, setRemoteUser] = useState<User | null>(null);

  // Update current user when socket connects
  useEffect(() => {
    if (socket) {
      setCurrentUser({
        id: socket.id || generateId(),
        isConnected: socketConnected
      });
    }
  }, [socket, socketConnected]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // When user starts searching
    const onSearching = () => {
      setIsSearching(true);
      setIsConnected(false);
    };

    // When user stops searching
    const onSearchStopped = () => {
      setIsSearching(false);
    };

    // When user is matched with another user
    const onMatched = ({ partnerId }: { partnerId: string }) => {
      setIsSearching(false);
      setIsConnected(true);
      setRemoteUser({
        id: partnerId,
        isConnected: true
      });
      
      // Welcome message
      setMessages([
        {
          id: generateId(),
          senderId: 'system',
          content: 'You are now connected with a stranger. Say hello!',
          timestamp: new Date(),
        },
      ]);
      
      toast({
        title: 'Connected!',
        description: 'You are now chatting with a stranger.',
      });
    };

    // When partner disconnects or skips
    const onPartnerDisconnected = () => {
      toast({
        title: 'Chat ended',
        description: 'Your chat partner has disconnected.',
      });
      
      setIsConnected(false);
      setRemoteUser(null);
    };

    // When partner skips this user
    const onPartnerSkipped = () => {
      toast({
        title: 'Chat ended',
        description: 'Your chat partner skipped you.',
      });
      
      setIsConnected(false);
      setRemoteUser(null);
    };

    // When chat is ended by partner
    const onChatEnded = () => {
      toast({
        title: 'Chat ended',
        description: 'Your chat partner ended the chat.',
      });
      
      setIsConnected(false);
      setRemoteUser(null);
    };

    // When receiving a message
    const onReceiveMessage = ({ source, message, timestamp }: { source: string, message: string, timestamp: string }) => {
      const newMessage = {
        id: generateId(),
        senderId: source,
        content: message,
        timestamp: new Date(timestamp),
      };
      
      setMessages(prev => [...prev, newMessage]);
    };

    // Add event listeners
    socket.on('searching', onSearching);
    socket.on('search_stopped', onSearchStopped);
    socket.on('matched', onMatched);
    socket.on('partner_disconnected', onPartnerDisconnected);
    socket.on('partner_skipped', onPartnerSkipped);
    socket.on('chat_ended', onChatEnded);
    socket.on('receive_message', onReceiveMessage);

    // Clean up listeners on unmount
    return () => {
      socket.off('searching', onSearching);
      socket.off('search_stopped', onSearchStopped);
      socket.off('matched', onMatched);
      socket.off('partner_disconnected', onPartnerDisconnected);
      socket.off('partner_skipped', onPartnerSkipped);
      socket.off('chat_ended', onChatEnded);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [socket, toast]);

  // Start searching for a match
  const startSearching = useCallback(() => {
    if (!socket || isSearching || isConnected) return;
    
    socket.emit('start_searching');
    setIsSearching(true);
  }, [socket, isSearching, isConnected]);

  // Stop searching
  const stopSearching = useCallback(() => {
    if (!socket || !isSearching) return;
    
    socket.emit('stop_searching');
    setIsSearching(false);
  }, [socket, isSearching]);

  // End the current chat
  const endChat = useCallback(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('end_chat');
    setIsConnected(false);
    setRemoteUser(null);
    setMessages([]);
    
    toast({
      title: 'Chat ended',
      description: 'You have disconnected from the chat.',
    });
  }, [socket, isConnected, toast]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!socket || !isConnected || !remoteUser || !content.trim()) return;
    
    const newMessage = {
      id: generateId(),
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date(),
    };
    
    // Add message to local state
    setMessages(prev => [...prev, newMessage]);
    
    // Send message to server
    socket.emit('send_message', {
      target: remoteUser.id,
      message: content.trim()
    });
  }, [socket, isConnected, remoteUser, currentUser.id]);

  // Report the current user
  const reportUser = useCallback(() => {
    if (!socket || !isConnected || !remoteUser) return;
    
    socket.emit('report_user', {
      targetId: remoteUser.id,
      reason: 'inappropriate behavior'
    });
    
    toast({
      title: 'User Reported',
      description: 'Thank you for keeping the community safe.',
      variant: 'destructive',
    });
    
    // End the chat after reporting
    endChat();
  }, [socket, isConnected, remoteUser, endChat, toast]);

  // Skip to next user
  const skipUser = useCallback(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('skip');
    setIsConnected(false);
    setRemoteUser(null);
    setMessages([]);
    
    // Socket will automatically put us back in the queue
    setIsSearching(true);
  }, [socket, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socket && isConnected) {
        socket.emit('end_chat');
      }
    };
  }, [socket, isConnected]);

  return (
    <ChatContext.Provider
      value={{
        isSearching,
        isConnected,
        messages,
        currentUser,
        remoteUser,
        startSearching,
        stopSearching,
        endChat,
        sendMessage,
        reportUser,
        skipUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
