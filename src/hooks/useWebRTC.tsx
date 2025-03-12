
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';

interface PeerConfig {
  iceServers: Array<{ urls: string | string[] } | { urls: string | string[], username: string, credential: string }>;
}

interface UseWebRTCProps {
  isCallStarted: boolean;
  partnerId: string | null;
  onRemoteStreamChange?: (stream: MediaStream | null) => void;
}

// Configuration with public STUN servers and a TURN server
// In production, you should use your own TURN servers
const DEFAULT_PEER_CONFIG: PeerConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
    // Example TURN server (replace with your own in production)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

const useWebRTC = ({ isCallStarted, partnerId, onRemoteStreamChange }: UseWebRTCProps) => {
  const { socket } = useSocket();
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

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      console.log('Initializing local media stream');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      console.log('Local stream obtained');
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

  // Set up WebRTC peer connection
  const setupPeerConnection = useCallback((stream: MediaStream) => {
    if (!socket) return null;
    
    try {
      console.log('Setting up peer connection with config:', DEFAULT_PEER_CONFIG);
      const peerConnection = new RTCPeerConnection(DEFAULT_PEER_CONFIG);
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Set up remote stream handling
      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream');
          setRemoteStream(event.streams[0]);
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          
          if (onRemoteStreamChange) {
            onRemoteStreamChange(event.streams[0]);
          }
          
          setIsConnected(true);
          setIsConnecting(false);
        }
      };
      
      // ICE candidate handling
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && partnerId) {
          console.log('Sending ICE candidate to partner');
          socket.emit('ice_candidate', {
            target: partnerId,
            candidate: event.candidate,
          });
        }
      };
      
      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
        switch (peerConnection.connectionState) {
          case 'connected':
            setIsConnected(true);
            setIsConnecting(false);
            break;
          case 'disconnected':
          case 'failed':
            setIsConnected(false);
            setError('Connection failed or disconnected');
            break;
          case 'closed':
            setIsConnected(false);
            break;
          default:
            break;
        }
      };
      
      peerConnectionRef.current = peerConnection;
      return peerConnection;
    } catch (err) {
      console.error('Error setting up peer connection:', err);
      setError('Failed to set up video call connection');
      return null;
    }
  }, [socket, partnerId, onRemoteStreamChange]);

  // Create and send offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current || !socket || !partnerId) return;
    
    try {
      console.log('Creating offer for partner:', partnerId);
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      // Send offer to partner via signaling server
      socket.emit('offer', {
        target: partnerId,
        offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create connection offer');
    }
  }, [socket, partnerId]);

  // Handle incoming offer and create answer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, offererId: string) => {
    if (!peerConnectionRef.current || !socket) return;
    
    try {
      console.log('Received offer from:', offererId);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Send answer to offerer via signaling server
      socket.emit('answer', {
        target: offererId,
        answer,
      });
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle incoming connection');
    }
  }, [socket]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    
    try {
      console.log('Received answer, setting remote description');
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to establish connection');
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;
    
    try {
      console.log('Adding ICE candidate');
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  // Set up socket event listeners for WebRTC signaling
  useEffect(() => {
    if (!socket) return;
    
    // Handle incoming offer
    const onOffer = ({ source, offer }: { source: string, offer: RTCSessionDescriptionInit }) => {
      console.log(`Received offer from ${source}`);
      handleOffer(offer, source);
    };
    
    // Handle incoming answer
    const onAnswer = ({ source, answer }: { source: string, answer: RTCSessionDescriptionInit }) => {
      console.log(`Received answer from ${source}`);
      handleAnswer(answer);
    };
    
    // Handle incoming ICE candidate
    const onIceCandidate = ({ source, candidate }: { source: string, candidate: RTCIceCandidateInit }) => {
      console.log(`Received ICE candidate from ${source}`);
      handleIceCandidate(candidate);
    };
    
    // Add event listeners
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice_candidate', onIceCandidate);
    
    // Clean up on unmount
    return () => {
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice_candidate', onIceCandidate);
    };
  }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

  // Start or stop WebRTC connection based on call status
  useEffect(() => {
    const setupCall = async () => {
      // Only proceed if call should be started, we have a partner, and socket is connected
      if (!isCallStarted || !partnerId || !socket) {
        return;
      }
      
      console.log('Setting up WebRTC call with partner:', partnerId);
      setIsConnecting(true);
      
      // Initialize local stream if not already done
      const stream = localStream || await initializeLocalStream();
      if (!stream) {
        setIsConnecting(false);
        setError('Could not access camera or microphone');
        return;
      }
      
      // Create peer connection
      const peerConnection = setupPeerConnection(stream);
      if (!peerConnection) {
        setIsConnecting(false);
        setError('Failed to set up connection');
        return;
      }
      
      // Create and send offer to partner
      createOffer();
    };
    
    setupCall();
    
    // Cleanup function
    return () => {
      if (!isCallStarted && peerConnectionRef.current) {
        console.log('Closing peer connection');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        setRemoteStream(null);
        setIsConnected(false);
        setIsConnecting(false);
      }
    };
  }, [isCallStarted, partnerId, socket, localStream, initializeLocalStream, setupPeerConnection, createOffer]);

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

  // End the call
  const endCall = useCallback(() => {
    console.log('Ending WebRTC call');
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setRemoteStream(null);
    if (onRemoteStreamChange) onRemoteStreamChange(null);
    
    setIsConnected(false);
    setIsConnecting(false);
  }, [onRemoteStreamChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC resources');
      
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream]);

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
