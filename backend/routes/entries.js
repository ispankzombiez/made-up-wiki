const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Entry = require('../models/Entry');
const { authenticateToken } = require('../middleware/auth');

// Get all entries with optional search
router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const entries = await Entry.findAll(searchTerm);
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

// Get user's pending submissions
router.get('/pending/mine', authenticateToken, async (req, res) => {
  try {
    const entries = await Entry.getPendingByUser(req.user.id);
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching pending submissions' });
  }
});

// Get single entry by word name
router.get('/word/:word', async (req, res) => {
  try {
    const word = req.params.word;
    console.log('Looking for word:', word);
    const entry = await Entry.findByWord(word);
    console.log('Found entry:', entry);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    console.error('Error fetching word:', err);
    res.status(500).json({ error: 'Error fetching entry' });
  }
});

// Get single entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching entry' });
  }
});

// Create entry (contributors only)
router.post(
  '/',
  authenticateToken,
  [
    body('word').trim().notEmpty(),
    body('definition').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user.is_contributor) {
      return res.status(403).json({ error: 'Only contributors can create entries' });
    }

    try {
      const { word, partOfSpeech, pronunciation, definition, example, relatedWords, categories } = req.body;
      const entry = await Entry.create(word, partOfSpeech || null, pronunciation || null, definition, example || null, relatedWords || null, categories || null, req.user.id);
      res.status(201).json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating entry' });
    }
  }
);

// Update entry (contributors only - can edit their own pending entries)
router.put(
  '/:id',
  authenticateToken,
  [
    body('word').trim().notEmpty(),
    body('definition').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user.is_contributor) {
      return res.status(403).json({ error: 'Only contributors can edit entries' });
    }

    try {
      // Check if entry exists and belongs to user or user is admin
      const existingEntry = await db.query('SELECT created_by, status FROM entries WHERE id = $1', [req.params.id]);
      if (existingEntry.rows.length === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      const entry = existingEntry.rows[0];
      
      // Only allow editing pending entries by creator, or any entry by admin
      if (entry.created_by !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'You can only edit your own pending submissions' });
      }
      
      if (entry.status === 'approved' && !req.user.is_admin) {
        return res.status(403).json({ error: 'Cannot edit approved entries' });
      }

      const { word, partOfSpeech, pronunciation, definition, example, relatedWords, categories } = req.body;
      const updatedEntry = await Entry.update(req.params.id, word, partOfSpeech || null, pronunciation || null, definition, example || null, relatedWords || null, categories || null);
      if (!updatedEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(updatedEntry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating entry' });
    }
  }
);

// Delete entry (admins only)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Only admins can delete entries' });
  }

  try {
    const success = await Entry.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting entry' });
  }
});

module.exports = router;
