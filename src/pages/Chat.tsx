
import React from 'react';
import Navbar from '@/components/Navbar';
import VideoCall from '@/components/VideoCall';
import TextChat from '@/components/TextChat';
import UserControls from '@/components/UserControls';
import MatchingStatus from '@/components/MatchingStatus';
import { ChatProvider } from '@/context/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Chat = () => {
  const isMobile = useIsMobile();

  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container max-w-7xl pt-20 pb-10 px-4">
          <h1 className="text-2xl font-bold mb-6">Video Chat</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video call area */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md">
                <VideoCall />
              </div>
              
              {/* User controls - only show on desktop between video and chat */}
              {!isMobile && <UserControls />}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              {/* MatchingStatus - only visible on desktop */}
              {!isMobile && <MatchingStatus />}
              
              {/* Mobile user controls - only show on mobile */}
              {isMobile && <UserControls />}
              
              {/* Text chat */}
              <div className="h-[calc(70vh-10rem)] md:h-[calc(70vh-5rem)]">
                <TextChat />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ChatProvider>
  );
};

export default Chat;
