
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser] = useState<User>({ id: generateId(), isConnected: true });
  const [remoteUser, setRemoteUser] = useState<User | null>(null);

  // Start searching for a match
  const startSearching = useCallback(() => {
    if (isSearching || isConnected) return;
    
    setIsSearching(true);
    
    // For demo purposes, simulate finding a match after a random delay
    const timeout = setTimeout(() => {
      const newRemoteUser = { id: generateId(), isConnected: true };
      setRemoteUser(newRemoteUser);
      setIsSearching(false);
      setIsConnected(true);
      
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
    }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
    
    return () => clearTimeout(timeout);
  }, [isSearching, isConnected, toast]);

  // Stop searching
  const stopSearching = useCallback(() => {
    if (!isSearching) return;
    setIsSearching(false);
  }, [isSearching]);

  // End the current chat
  const endChat = useCallback(() => {
    if (!isConnected) return;
    
    setIsConnected(false);
    setRemoteUser(null);
    setMessages([]);
    
    toast({
      title: 'Chat ended',
      description: 'You have disconnected from the chat.',
    });
  }, [isConnected, toast]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !content.trim()) return;
    
    const newMessage = {
      id: generateId(),
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // For demo purposes, simulate receiving a response after a delay
    if (Math.random() > 0.3) { // 70% chance of getting a response
      setTimeout(() => {
        const responses = [
          "Oh, that's interesting!",
          "I see what you mean.",
          "Really? Tell me more about that.",
          "I hadn't thought about it that way.",
          "Hmm, I'm not sure I agree, but I see your point.",
          "What made you think of that?",
          "That's cool! I've been thinking about that too.",
          "How long have you been interested in this topic?",
          "Fascinating perspective!",
          "I had a similar experience once.",
        ];
        
        const responseMessage = {
          id: generateId(),
          senderId: remoteUser?.id || 'unknown',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000);
    }
  }, [isConnected, currentUser.id, remoteUser]);

  // Report the current user
  const reportUser = useCallback(() => {
    if (!isConnected) return;
    
    toast({
      title: 'User Reported',
      description: 'Thank you for keeping the community safe.',
      variant: 'destructive',
    });
    
    // End the chat after reporting
    endChat();
  }, [isConnected, endChat, toast]);

  // Skip to next user
  const skipUser = useCallback(() => {
    if (!isConnected) return;
    
    endChat();
    
    // Start searching for a new match after a short delay
    setTimeout(() => {
      startSearching();
    }, 500);
  }, [isConnected, endChat, startSearching]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        endChat();
      }
    };
  }, [isConnected, endChat]);

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
