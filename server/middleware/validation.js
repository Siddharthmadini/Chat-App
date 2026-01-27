const validator = require('validator');

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      message: 'Email is required',
      field: 'email'
    });
  }

  // Check if email format is valid
  if (!validator.isEmail(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address',
      field: 'email'
    });
  }

  // Additional email domain validation (optional - you can customize this)
  const allowedDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
    'msn.com', 'yandex.com', 'mail.com', 'zoho.com'
  ];

  const emailDomain = email.split('@')[1]?.toLowerCase();
  
  // Check if it's a common email provider or has proper domain format
  const isValidDomain = allowedDomains.includes(emailDomain) || 
                       /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(emailDomain);

  if (!isValidDomain) {
    return res.status(400).json({ 
      message: 'Please use a valid email provider (Gmail, Yahoo, Outlook, etc.)',
      field: 'email'
    });
  }

  next();
};

// Username validation middleware
const validateUsername = (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ 
      message: 'Username is required',
      field: 'username'
    });
  }

  // Username should be 3-20 characters, alphanumeric and underscores only
  if (!validator.isLength(username, { min: 3, max: 20 })) {
    return res.status(400).json({ 
      message: 'Username must be between 3 and 20 characters',
      field: 'username'
    });
  }

  if (!validator.isAlphanumeric(username.replace(/_/g, ''))) {
    return res.status(400).json({ 
      message: 'Username can only contain letters, numbers, and underscores',
      field: 'username'
    });
  }

  // Check for inappropriate usernames
  const bannedUsernames = [
    'admin', 'administrator', 'root', 'system', 'support', 'help',
    'moderator', 'mod', 'staff', 'owner', 'null', 'undefined',
    'test', 'demo', 'guest', 'anonymous', 'user', 'username'
  ];

  if (bannedUsernames.includes(username.toLowerCase())) {
    return res.status(400).json({ 
      message: 'This username is not allowed. Please choose a different one.',
      field: 'username'
    });
  }

  next();
};

// Password validation middleware
const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ 
      message: 'Password is required',
      field: 'password'
    });
  }

  // Password should be at least 8 characters
  if (!validator.isLength(password, { min: 8 })) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long',
      field: 'password'
    });
  }

  // Password should contain at least one uppercase, one lowercase, one number
  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })) {
    return res.status(400).json({ 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      field: 'password'
    });
  }

  next();
};

// Registration validation (combines all validations)
const validateRegistration = [validateEmail, validateUsername, validatePassword];

// Login validation
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required'
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address',
      field: 'email'
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRegistration,
  validateLogin
};