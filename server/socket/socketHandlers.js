const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

    // Join user-specific room for direct messages
    socket.join(`user_${socket.userId}`);

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

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.username} disconnected`);

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    });
  };
};

module.exports = { socketAuth, handleConnection };