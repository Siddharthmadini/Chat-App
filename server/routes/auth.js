const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Register
router.post('/register', registrationLimiter, validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        userCode: user.userCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user has a userCode, if not generate one
    if (!user.userCode) {
      const generateUserCode = () => {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      };
      
      let userCode;
      let isUnique = false;
      
      // Generate unique user code
      while (!isUnique) {
        userCode = generateUserCode();
        const existingUser = await User.findOne({ userCode });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      user.userCode = userCode;
      await user.save();
    }

    // Update online status
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        userCode: user.userCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Check if user has a userCode, if not generate one
    if (!req.user.userCode) {
      const generateUserCode = () => {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      };
      
      let userCode;
      let isUnique = false;
      
      // Generate unique user code
      while (!isUnique) {
        userCode = generateUserCode();
        const existingUser = await User.findOne({ userCode });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      req.user.userCode = userCode;
      await req.user.save();
    }

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        isOnline: req.user.isOnline,
        userCode: req.user.userCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;