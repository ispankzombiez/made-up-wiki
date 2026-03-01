const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  next();
};

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Total word count
    const wordCountResult = await db.query('SELECT COUNT(*) as count FROM entries');
    const totalWords = wordCountResult.rows[0].count;

    // Total users
    const userCountResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = userCountResult.rows[0].count;

    // Total contributors
    const contributorCountResult = await db.query(
      'SELECT COUNT(DISTINCT created_by) as count FROM entries'
    );
    const totalContributors = contributorCountResult.rows[0].count;

    // Words by category
    const categoriesResult = await db.query(`
      SELECT categories, COUNT(*) as count FROM entries 
      WHERE categories IS NOT NULL AND categories != ''
      GROUP BY categories
    `);
    
    const categoryCounts = {};
    categoriesResult.rows.forEach(row => {
      const cats = row.categories.split(',').map(c => c.trim());
      cats.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    // Words by part of speech
    const posResult = await db.query(`
      SELECT part_of_speech, COUNT(*) as count FROM entries 
      WHERE part_of_speech IS NOT NULL AND part_of_speech != ''
      GROUP BY part_of_speech
      ORDER BY count DESC
    `);

    const partOfSpeechCounts = {};
    posResult.rows.forEach(row => {
      partOfSpeechCounts[row.part_of_speech || 'Unknown'] = row.count;
    });

    // Recently created entries
    const recentEntriesResult = await db.query(`
      SELECT e.id, e.word, e.created_by, e.created_at, u.username as created_by_username 
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC 
      LIMIT 10
    `);

    // Top contributors
    const topContributorsResult = await db.query(`
      SELECT e.created_by, u.username as created_by_username, COUNT(*) as count 
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      GROUP BY e.created_by, u.username
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Words created this month
    const thisMonthResult = await db.query(`
      SELECT COUNT(*) as count FROM entries 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const wordsThisMonth = thisMonthResult.rows[0].count;

    res.json({
      totalWords,
      totalUsers,
      totalContributors,
      categoryCounts: Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      partOfSpeechCounts: Object.entries(partOfSpeechCounts)
        .map(([pos, count]) => ({ pos, count })),
      recentEntries: recentEntriesResult.rows,
      topContributors: topContributorsResult.rows,
      wordsThisMonth
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Get all pending submissions for admin review
router.get('/submissions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.categories, 
        e.created_by,
        u.username as created_by_username,
        e.created_at, 
        e.updated_at,
        e.status
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// Approve a submission
router.post('/submissions/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE entries SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({
      message: 'Submission approved',
      entry: result.rows[0]
    });
  } catch (err) {
    console.error('Error approving submission:', err);
    res.status(500).json({ error: 'Error approving submission' });
  }
});

// Reject a submission
router.post('/submissions/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM entries WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({
      message: 'Submission rejected and deleted'
    });
  } catch (err) {
    console.error('Error rejecting submission:', err);
    res.status(500).json({ error: 'Error rejecting submission' });
  }
});

module.exports = router;
