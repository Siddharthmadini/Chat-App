const express = require('express');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to format a message for the client
const formatMessage = (m, currentUserId) => ({
  id: m._id.toString(),
  content: m.isDeleted ? null : m.content,
  isDeleted: m.isDeleted,
  createdAt: m.createdAt,
  isRead: m.isRead,
  isStarred: m.starredBy?.some(id => id.toString() === currentUserId.toString()) || false,
  sender: {
    id: m.sender._id.toString(),
    username: m.sender.username,
    avatar: m.sender.avatar
  },
  receiver: {
    id: m.receiver._id.toString(),
    username: m.receiver.username,
    avatar: m.receiver.avatar
  },
  replyTo: m.replyTo ? {
    id: m.replyTo._id.toString(),
    content: m.replyTo.isDeleted ? null : m.replyTo.content,
    isDeleted: m.replyTo.isDeleted,
    sender: {
      id: m.replyTo.sender._id.toString(),
      username: m.replyTo.sender.username
    }
  } : null
});

// Get direct messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: 'You can only message friends' });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    await DirectMessage.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      messages: messages.reverse().map(m => formatMessage(m, req.user._id)),
      currentPage: page,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a message (sender only, soft delete)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await DirectMessage.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    message.isDeleted = true;
    message.content = '';
    await message.save();

    res.json({ message: 'Message deleted', messageId: req.params.messageId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle star on a message
router.put('/:messageId/star', auth, async (req, res) => {
  try {
    const message = await DirectMessage.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userId = req.user._id;
    const alreadyStarred = message.starredBy.some(id => id.toString() === userId.toString());

    if (alreadyStarred) {
      message.starredBy = message.starredBy.filter(id => id.toString() !== userId.toString());
    } else {
      message.starredBy.push(userId);
    }

    await message.save();

    res.json({
      messageId: req.params.messageId,
      isStarred: !alreadyStarred
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get starred messages for current user
router.get('/starred/all', auth, async (req, res) => {
  try {
    const messages = await DirectMessage.find({
      starredBy: req.user._id,
      isDeleted: false
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'username' } })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      messages: messages.map(m => formatMessage(m, req.user._id))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send direct message (REST fallback)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.friends.includes(receiverId)) {
      return res.status(403).json({ message: 'You can only message friends' });
    }
    const message = new DirectMessage({ sender: req.user._id, receiver: receiverId, content });
    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCount = await DirectMessage.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
