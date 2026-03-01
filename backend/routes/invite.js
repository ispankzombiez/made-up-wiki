const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const InviteCode = require('../models/InviteCode');
const User = require('../models/User');

// Create new invite code (admin/owner only - you would manually verify this is the owner)
router.post('/create', authenticateToken, async (req, res) => {
  // For now, this is open to any authenticated user creating invites for themselves
  // You can enhance this by checking if the user is the owner/admin
  try {
    const inviteCode = await InviteCode.create();
    res.status(201).json(inviteCode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating invite code' });
  }
});

// Get all invite codes (admin/owner only)
router.get('/codes', authenticateToken, async (req, res) => {
  try {
    // TODO: Add owner verification here
    const codes = await InviteCode.getAllCodes();
    res.json(codes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching invite codes' });
  }
});

// Get all users (contributors only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Update user contributor status (contributors only)
router.put('/users/:id/contributor', authenticateToken, async (req, res) => {
  try {
    const { is_contributor } = req.body;
    const user = await User.setContributor(req.params.id, is_contributor);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

module.exports = router;
