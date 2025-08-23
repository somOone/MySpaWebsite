const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Admin credentials (in production, these would be environment variables)
const ADMIN_USERNAME = 'adm!n';
const ADMIN_PASSWORD_HASH = '$2a$12$2HvaI6GGiHgP4mgI1VDetO7DozuKxgegHB8k32KjAspMvw0PH/sSe'; // "Admin123!" hashed

// Middleware to check if admin is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Check username
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set admin session
    req.session.isAdmin = true;
    req.session.adminUsername = username;
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      username: username
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.json({ 
      authenticated: true, 
      username: req.session.adminUsername 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected route example
router.get('/protected', requireAuth, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    username: req.session.adminUsername 
  });
});

module.exports = { router, requireAuth };
