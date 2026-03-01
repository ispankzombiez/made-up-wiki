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
    let query = 'SELECT id, word, part_of_speech, pronunciation, definition, example, related_words, created_by, created_at, updated_at FROM entries';
    const params = [];

    if (searchTerm) {
      query += ' WHERE LOWER(word) LIKE LOWER($1) OR LOWER(definition) LIKE LOWER($2)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    query += ' ORDER BY word ASC';
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, word, part_of_speech, pronunciation, definition, example, related_words, created_by, created_at, updated_at FROM entries WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, word, partOfSpeech, pronunciation, definition, example, relatedWords) {
    const result = await db.query(
      'UPDATE entries SET word = $1, part_of_speech = $2, pronunciation = $3, definition = $4, example = $5, related_words = $6, updated_at = NOW() WHERE id = $7 RETURNING id, word, part_of_speech, pronunciation, definition, example, related_words, created_by, created_at, updated_at',
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
