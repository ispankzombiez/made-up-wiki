const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const InviteCode = require('../models/InviteCode');
const authenticateToken = require('../middleware/auth');

// Sign up with invite code
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('inviteCode').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, inviteCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Validate invite code
      const invite = await InviteCode.findByCode(inviteCode);
      if (!invite) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }
      if (invite.used_at) {
        return res.status(400).json({ error: 'This invite code has already been used' });
      }

      // Create user
      const newUser = await User.create(email, password);

      // Mark invite code as used
      await InviteCode.markUsed(inviteCode, newUser.id);

      // Generate token
      const token = User.generateToken(newUser);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: newUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating user' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const passwordMatch = await User.verifyPassword(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = User.generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          is_contributor: user.is_contributor,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error logging in' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

module.exports = router;
