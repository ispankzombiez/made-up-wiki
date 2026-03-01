const db = require('../db');
const crypto = require('crypto');

class Entry {
  static async create(word, partOfSpeech, pronunciation, definition, example, relatedWords, createdBy) {
    const result = await db.query(
      'INSERT INTO entries (word, part_of_speech, pronunciation, definition, example, related_words, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, word, part_of_speech, pronunciation, definition, example, related_words, created_by, created_at, updated_at',
      [word, partOfSpeech, pronunciation, definition, example, relatedWords, createdBy]
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
      e.created_by, 
      COALESCE(u.username, 'Unknown') as created_by_username,
      e.created_at, 
      e.updated_at 
    FROM entries e
    LEFT JOIN users u ON e.created_by = u.id`;
    const params = [];

    if (searchTerm) {
      query += ' WHERE LOWER(e.word) LIKE LOWER($1) OR LOWER(e.definition) LIKE LOWER($2)';
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
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at 
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByWord(word) {
    const result = await db.query(
      `SELECT 
        e.id, 
        e.word, 
        e.part_of_speech, 
        e.pronunciation, 
        e.definition, 
        e.example, 
        e.related_words, 
        e.created_by,
        COALESCE(u.username, 'Unknown') as created_by_username,
        e.created_at, 
        e.updated_at 
      FROM entries e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE LOWER(e.word) = LOWER($1)`,
      [word]
    );
    return result.rows[0];
  }

  static async update(id, word, partOfSpeech, pronunciation, definition, example, relatedWords) {
    const result = await db.query(
      `UPDATE entries SET word = $1, part_of_speech = $2, pronunciation = $3, definition = $4, example = $5, related_words = $6, updated_at = NOW() WHERE id = $7 
      RETURNING id, word, part_of_speech, pronunciation, definition, example, related_words, created_by, created_at, updated_at`,
      [word, partOfSpeech, pronunciation, definition, example, relatedWords, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Entry;
