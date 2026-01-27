const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  return async (socket) => {
    console.log(`User ${socket.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    });

    // Join default room and user-specific room
    socket.join('general');
    socket.join(`user_${socket.userId}`);

    // Broadcast user joined
    socket.to('general').emit('userJoined', {
      username: socket.username,
      message: `${socket.username} joined the chat`
    });

    // Handle joining rooms
    socket.on('joinRoom', (room) => {
      socket.leave('general');
      socket.join(room);
      socket.emit('roomJoined', room);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { content, room = 'general' } = data;

        // Save message to database
        const message = new Message({
          sender: socket.userId,
          content,
          room
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Emit message to room
        io.to(room).emit('newMessage', {
          id: message._id,
          content: message.content,
          sender: {
            id: message.sender._id,
            username: message.sender.username,
            avatar: message.sender.avatar
          },
          room: message.room,
          createdAt: message.createdAt
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle sending direct messages
    socket.on('sendDirectMessage', async (data) => {
      try {
        const { content, receiverId } = data;

        // Check if users are friends
        const currentUser = await User.findById(socket.userId);
        if (!currentUser.friends.includes(receiverId)) {
          socket.emit('error', { message: 'You can only message friends' });
          return;
        }

        // Save direct message to database
        const directMessage = new DirectMessage({
          sender: socket.userId,
          receiver: receiverId,
          content
        });

        await directMessage.save();
        await directMessage.populate('sender', 'username avatar');
        await directMessage.populate('receiver', 'username avatar');

        // Emit to both sender and receiver
        const messageData = {
          id: directMessage._id,
          content: directMessage.content,
          sender: {
            id: directMessage.sender._id,
            username: directMessage.sender.username,
            avatar: directMessage.sender.avatar
          },
          receiver: {
            id: directMessage.receiver._id,
            username: directMessage.receiver.username,
            avatar: directMessage.receiver.avatar
          },
          createdAt: directMessage.createdAt,
          isRead: directMessage.isRead
        };

        // Send to receiver if online
        socket.to(`user_${receiverId}`).emit('newDirectMessage', messageData);
        // Send back to sender for confirmation
        socket.emit('directMessageSent', messageData);

      } catch (error) {
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Handle joining user-specific room for direct messages
    socket.on('joinUserRoom', () => {
      socket.join(`user_${socket.userId}`);
    });

    // Handle direct message typing indicators
    socket.on('directTyping', (data) => {
      const { receiverId, isTyping } = data;
      socket.to(`user_${receiverId}`).emit('userDirectTyping', {
        senderId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.room || 'general').emit('userTyping', {
        username: socket.username,
        isTyping: true
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(data.room || 'general').emit('userTyping', {
        username: socket.username,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.username} disconnected`);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast user left
      socket.broadcast.emit('userLeft', {
        username: socket.username,
        message: `${socket.username} left the chat`
      });
    });
  };
};

module.exports = { socketAuth, handleConnection };