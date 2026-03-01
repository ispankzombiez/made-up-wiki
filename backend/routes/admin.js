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

module.exports = router;
