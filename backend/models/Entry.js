const db = require('../db');
const crypto = require('crypto');

class Entry {
  static async create(word, partOfSpeech, pronunciation, definition, example, relatedWords, categories, createdBy) {
    const result = await db.query(
      "INSERT INTO entries (word, part_of_speech, pronunciation, definition, example, related_words, categories, created_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING id, word, part_of_speech, pronunciation, definition, example, related_words, categories, created_by, status, created_at, updated_at",
      [word, partOfSpeech, pronunciation, definition, example, relatedWords, categories, createdBy]
    );
    return result.rows[0];
  }

  static async findAll(searchTerm = '') {
    let query = `SELECT 
      e.id, 
      e.word, 
      e.part_of_speech, 
      e.pronunciation, 
      e.definition, 
      e.example, 
      e.related_words, 
      e.categories, 
      e.created_by, 
      COALESCE(u.username, 'Unknown') as created_by_username,
      e.created_at, 
      e.updated_at,
      e.status
    FROM entries e
    LEFT JOIN users u ON e.created_by = u.id
    WHERE e.status = 'approved'`;
    const params = [];

    if (searchTerm) {
      query += ' AND (LOWER(e.word) LIKE LOWER($1) OR LOWER(e.definition) LIKE LOWER($2))';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    query += ' ORDER BY e.word ASC';
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.categories, 
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at,
        e.status
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1 AND e.status = 'approved'`,
      [id]
    );
    return result.rows[0];
  }

  static async findByWord(word) {
    console.log('Entry.findByWord called with:', word);
    const result = await db.query(
      `SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.categories, 
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at,
        e.status
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE LOWER(e.word) = LOWER($1) AND e.status = 'approved'`,
      [word]
    );
    console.log('Query result:', result.rows);
    return result.rows[0];
  }

  static async update(id, word, partOfSpeech, pronunciation, definition, example, relatedWords, categories) {
    const result = await db.query(
      `UPDATE entries SET word = $1, part_of_speech = $2, pronunciation = $3, definition = $4, example = $5, related_words = $6, categories = $7, updated_at = NOW() WHERE id = $8 
      RETURNING id, word, part_of_speech, pronunciation, definition, example, related_words, categories, created_by, created_at, updated_at`,
      [word, partOfSpeech, pronunciation, definition, example, relatedWords, categories, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  static async getPendingByUser(userId) {
    const result = await db.query(
      `SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.categories, 
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at,
        e.status
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.created_by = $1 AND e.status = 'pending'
      ORDER BY e.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getAllPending() {
    const result = await db.query(
      `SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.categories, 
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at,
        e.status
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC`
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE entries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, word, status, created_by',
      [status, id]
    );
    return result.rows[0];
  }
}
