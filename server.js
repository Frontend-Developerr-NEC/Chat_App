require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // When a new user joins
  socket.on('new-user', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-connected', username);
    io.emit('update-users', users);
  });

  // When a user sends a message
  socket.on('send-chat-message', (message) => {
    socket.broadcast.emit('chat-message', {
      message,
      username: users[socket.id]
    });
  });

  // When a user is typing
  socket.on('typing', () => {
    socket.broadcast.emit('user-typing', users[socket.id]);
  });

  // When a user stops typing
  socket.on('stop-typing', () => {
    socket.broadcast.emit('user-stopped-typing', users[socket.id]);
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit('user-disconnected', username);
      delete users[socket.id];
      io.emit('update-users', users);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port \nhttp://localhost:${PORT}`);
});

