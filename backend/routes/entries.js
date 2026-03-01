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

// Get single entry by word name
router.get('/word/:word', async (req, res) => {
  try {
    const entry = await Entry.findByWord(req.params.word);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    console.error(err);
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
      const { word, partOfSpeech, pronunciation, definition, example, relatedWords } = req.body;
      const entry = await Entry.create(word, partOfSpeech || null, pronunciation || null, definition, example || null, relatedWords || null, req.user.id);
      res.status(201).json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating entry' });
    }
  }
);

// Update entry (contributors only)
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
      const { word, partOfSpeech, pronunciation, definition, example, relatedWords } = req.body;
      const entry = await Entry.update(req.params.id, word, partOfSpeech || null, pronunciation || null, definition, example || null, relatedWords || null);
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating entry' });
    }
  }
);

// Delete entry (contributors only)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!req.user.is_contributor) {
    return res.status(403).json({ error: 'Only contributors can delete entries' });
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
