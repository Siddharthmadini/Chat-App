const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get own profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get another user's profile (for friends)
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'username avatar bio userCode isOnline lastSeen'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile (avatar + bio)
router.put('/', auth, async (req, res) => {
  try {
    const { avatar, bio } = req.body;

    // Validate bio word count (max 60 words)
    if (bio !== undefined) {
      const wordCount = bio.trim() === '' ? 0 : bio.trim().split(/\s+/).length;
      if (wordCount > 60) {
        return res.status(400).json({
          message: 'Bio cannot exceed 60 words',
          field: 'bio'
        });
      }
    }

    // Validate avatar (must be base64 image or empty string)
    if (avatar !== undefined && avatar !== '') {
      const isValidBase64Image = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(avatar);
      if (!isValidBase64Image) {
        return res.status(400).json({
          message: 'Avatar must be a valid image (JPEG, PNG, GIF, or WebP)',
          field: 'avatar'
        });
      }

      // Limit avatar size to ~2MB (base64 string length)
      if (avatar.length > 2 * 1024 * 1024 * 1.37) {
        return res.status(400).json({
          message: 'Avatar image must be smaller than 2MB',
          field: 'avatar'
        });
      }
    }

    const updates = {};
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
