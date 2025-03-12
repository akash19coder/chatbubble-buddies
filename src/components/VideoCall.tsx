
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import useWebRTC from '@/hooks/useWebRTC';
import { useChatContext } from '@/context/ChatContext';
import { Mic, MicOff, Video, VideoOff, UserX, SkipForward, Flag } from 'lucide-react';
import Button from './Button';

const VideoCall: React.FC = () => {
  const { isConnected, isSearching, endChat, reportUser, skipUser } = useChatContext();
  
  const {
    localVideoRef,
    remoteVideoRef,
    isConnecting,
    isMuted,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    initializeLocalStream
  } = useWebRTC({
    isCallStarted: isConnected || isSearching,
  });

  // Initialize local stream when component mounts
  useEffect(() => {
    initializeLocalStream();
  }, [initializeLocalStream]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-accent">
      {/* Remote video (full size background) */}
      <div className="absolute inset-0 bg-black">
        {isConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-accent">
            {isSearching || isConnecting ? (
              <div className="text-center">
                <div className="inline-block rounded-full p-3 bg-primary/10 mb-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-medium">Looking for someone to chat with...</p>
                <p className="text-sm text-foreground/60 mt-2">This won't take long!</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="inline-block rounded-full p-3 bg-primary/10 mb-4">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium">Start a new chat</p>
                <p className="text-sm text-foreground/60 mt-2">
                  Click "Connect" to start chatting with random people
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Local video (small picture-in-picture) */}
      <div className="absolute bottom-4 right-4 w-32 h-44 md:w-48 md:h-64 rounded-xl overflow-hidden shadow-lg border border-white/10 glass">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            !isVideoEnabled && "invisible"
          )}
        />
        
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <VideoOff className="w-8 h-8 text-white/60" />
          </div>
        )}
      </div>

      {/* Controls overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center">
        <div className="glass-card p-3 flex items-center space-x-2">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={cn(
              "glass-button p-3",
              isMuted && "bg-red-500/10 text-red-500"
            )}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={cn(
              "glass-button p-3",
              !isVideoEnabled && "bg-red-500/10 text-red-500"
            )}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {/* Skip button */}
          {isConnected && (
            <button
              onClick={skipUser}
              className="glass-button p-3 text-yellow-500"
              title="Skip to next person"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}

          {/* Report button */}
          {isConnected && (
            <button
              onClick={reportUser}
              className="glass-button p-3 text-red-500"
              title="Report user"
            >
              <Flag className="w-5 h-5" />
            </button>
          )}

          {/* End chat button */}
          {isConnected && (
            <button
              onClick={endChat}
              className="glass-button p-3 bg-red-500/80 text-white hover:bg-red-500"
              title="End chat"
            >
              <UserX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
