
import { useState, useEffect, useRef, useCallback } from 'react';

interface PeerConfig {
  iceServers: Array<{ urls: string | string[] }>;
}

interface UseWebRTCProps {
  isCallStarted: boolean;
  onRemoteStreamChange?: (stream: MediaStream | null) => void;
}

const DEFAULT_PEER_CONFIG: PeerConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
};

// This is a mock implementation since we don't have a real signaling server yet
const useWebRTC = ({ isCallStarted, onRemoteStreamChange }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // For demo purposes, we're simulating the connection
  // In a real app, this would connect to a signaling server
  
  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      return null;
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setIsMuted(!enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setIsVideoEnabled(enabled);
      }
    }
  }, [localStream]);

  // For demo purposes, simulate the connection and remote stream after a delay
  useEffect(() => {
    if (isCallStarted && !isConnected && !isConnecting) {
      const setupCall = async () => {
        setIsConnecting(true);
        const stream = localStream || await initializeLocalStream();
        
        if (!stream) {
          setIsConnecting(false);
          return;
        }
        
        // In a real implementation, this would be setting up the WebRTC connection
        // For now, we'll simulate getting a remote stream after a delay
        setTimeout(() => {
          // Simulate getting a remote stream (in reality this would come from the peer)
          // For demo, we'll just clone the local stream
          const fakeRemoteStream = stream.clone();
          
          setRemoteStream(fakeRemoteStream);
          if (onRemoteStreamChange) onRemoteStreamChange(fakeRemoteStream);
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = fakeRemoteStream;
          }
          
          setIsConnecting(false);
          setIsConnected(true);
          
          console.log('Remote stream connected (simulated)');
        }, 2000); // Simulate connection delay
      };
      
      setupCall();
    }
  }, [isCallStarted, isConnected, isConnecting, localStream, initializeLocalStream, onRemoteStreamChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream]);

  // End the call
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setRemoteStream(null);
    if (onRemoteStreamChange) onRemoteStreamChange(null);
    
    setIsConnected(false);
    setIsConnecting(false);
  }, [localStream, onRemoteStreamChange]);

  return {
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isVideoEnabled,
    isConnecting,
    isConnected,
    error,
    toggleAudio,
    toggleVideo,
    endCall,
    initializeLocalStream,
  };
};

export default useWebRTC;
