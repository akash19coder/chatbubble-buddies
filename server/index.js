
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// User queues
const waitingUsers = [];
const connectedPairs = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // When user starts searching
  socket.on('start_searching', () => {
    console.log(`User ${socket.id} started searching`);
    
    // Add user to waiting queue if not already in queue
    if (!waitingUsers.includes(socket.id) && !isUserConnected(socket.id)) {
      waitingUsers.push(socket.id);
      
      // Emit searching status to the user
      socket.emit('searching');
      
      // Try to match with another user
      tryMatch();
    }
  });
  
  // When user stops searching
  socket.on('stop_searching', () => {
    console.log(`User ${socket.id} stopped searching`);
    
    // Remove user from waiting queue
    const index = waitingUsers.indexOf(socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
    
    socket.emit('search_stopped');
  });
  
  // WebRTC signaling
  socket.on('offer', ({ target, offer }) => {
    console.log(`Offer from ${socket.id} to ${target}`);
    io.to(target).emit('offer', { source: socket.id, offer });
  });
  
  socket.on('answer', ({ target, answer }) => {
    console.log(`Answer from ${socket.id} to ${target}`);
    io.to(target).emit('answer', { source: socket.id, answer });
  });
  
  socket.on('ice_candidate', ({ target, candidate }) => {
    io.to(target).emit('ice_candidate', { source: socket.id, candidate });
  });
  
  // Handle chat messages
  socket.on('send_message', ({ target, message }) => {
    io.to(target).emit('receive_message', { 
      source: socket.id, 
      message, 
      timestamp: new Date() 
    });
  });
  
  // Skip current chat partner
  socket.on('skip', () => {
    const partnerId = disconnectPair(socket.id);
    
    if (partnerId) {
      // Notify the partner that they were skipped
      io.to(partnerId).emit('partner_skipped');
    }
    
    // Add user back to waiting queue
    if (!waitingUsers.includes(socket.id)) {
      waitingUsers.push(socket.id);
      socket.emit('searching');
      
      // Try to match with another user
      tryMatch();
    }
  });
  
  // End current chat
  socket.on('end_chat', () => {
    const partnerId = disconnectPair(socket.id);
    
    if (partnerId) {
      // Notify the partner that chat was ended
      io.to(partnerId).emit('chat_ended');
    }
  });
  
  // Report user
  socket.on('report_user', ({ targetId, reason }) => {
    console.log(`User ${targetId} was reported by ${socket.id} for: ${reason}`);
    
    // In a real app, this would save the report to a database
    // For now, just disconnect them
    const partnerId = disconnectPair(socket.id);
    
    if (partnerId) {
      io.to(partnerId).emit('chat_ended');
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from waiting queue
    const index = waitingUsers.indexOf(socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
    
    // If in a pair, notify partner
    const partnerId = disconnectPair(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner_disconnected');
    }
  });
  
  // Helper function to try matching users
  function tryMatch() {
    // Need at least 2 users to match
    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift();
      const user2 = waitingUsers.shift();
      
      // Create a pair and save it
      connectedPairs.set(user1, user2);
      connectedPairs.set(user2, user1);
      
      // Notify both users they are connected
      io.to(user1).emit('matched', { partnerId: user2 });
      io.to(user2).emit('matched', { partnerId: user1 });
      
      console.log(`Matched users: ${user1} and ${user2}`);
    }
  }
  
  // Check if a user is connected to someone
  function isUserConnected(userId) {
    return connectedPairs.has(userId);
  }
  
  // Disconnect a pair and return partner ID
  function disconnectPair(userId) {
    const partnerId = connectedPairs.get(userId);
    
    if (partnerId) {
      // Remove both users from connected pairs
      connectedPairs.delete(userId);
      connectedPairs.delete(partnerId);
      return partnerId;
    }
    
    return null;
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
