const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store online users
const onlineUsers = new Set();

// Store group memberships
const groupMembers = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  console.log(`User connected: ${userId}`);
  
  // Add user to online users
  if (userId) {
    onlineUsers.add(userId);
    
    // Broadcast updated online users list
    io.emit('online-users', Array.from(onlineUsers));
  }
  
  // Handle private messages
  socket.on('private-message', (message) => {
    console.log('Private message:', message);
    
    // Emit the message to the recipient
    socket.to(message.recipientId).emit('private-message', message);
  });
  
  // Handle group messages
  socket.on('group-message', (message) => {
    console.log('Group message:', message);
    
    // Emit the message to all members of the group
    const groupId = message.groupId;
    socket.to(groupId).emit('group-message', message);
  });
  
  // Handle joining a group
  socket.on('join-group', ({ groupId, userId }) => {
    console.log(`User ${userId} joining group ${groupId}`);
    
    // Add user to the group room
    socket.join(groupId);
    
    // Track group membership
    if (!groupMembers.has(groupId)) {
      groupMembers.set(groupId, new Set());
    }
    groupMembers.get(groupId).add(userId);
    
    // Notify group members
    socket.to(groupId).emit('user-joined-group', { groupId, userId });
  });
  
  // Handle leaving a group
  socket.on('leave-group', ({ groupId, userId }) => {
    console.log(`User ${userId} leaving group ${groupId}`);
    
    // Remove user from the group room
    socket.leave(groupId);
    
    // Update group membership
    if (groupMembers.has(groupId)) {
      groupMembers.get(groupId).delete(userId);
    }
    
    // Notify group members
    socket.to(groupId).emit('user-left-group', { groupId, userId });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    
    // Remove user from online users
    if (userId) {
      onlineUsers.delete(userId);
      
      // Broadcast updated online users list
      io.emit('online-users', Array.from(onlineUsers));
    }
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('EcoChat Socket Server is running');
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});