
import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import Button from './Button';
import { Send } from 'lucide-react';

const TextChat: React.FC = () => {
  const { messages, sendMessage, isConnected, currentUser } = useChatContext();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && isConnected) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  return (
    <div className="h-full flex flex-col glass-card">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.length === 0 && !isConnected ? (
            <div className="text-center py-8 text-foreground/60">
              <p>Connect with someone to start chatting</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.senderId === 'system' 
                    ? 'justify-center' 
                    : message.senderId === currentUser.id 
                      ? 'justify-end' 
                      : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs md:max-w-sm rounded-xl p-3',
                    message.senderId === 'system'
                      ? 'bg-accent/50 text-foreground/60 text-sm text-center'
                      : message.senderId === currentUser.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  {message.content}
                  <div
                    className={cn(
                      'text-xs mt-1',
                      message.senderId === 'system'
                        ? 'text-foreground/40'
                        : message.senderId === currentUser.id
                        ? 'text-primary-foreground/80'
                        : 'text-foreground/50'
                    )}
                  >
                    {message.senderId !== 'system' && (
                      message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={isConnected ? "Type a message..." : "Connect with someone to chat"}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={!isConnected}
            className="flex-1 bg-background rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!isConnected || !messageText.trim()}
            size="icon"
            className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TextChat;
