const db = require('../db');
const crypto = require('crypto');

class Entry {
  static async create(word, definition, createdBy) {
    const result = await db.query(
      'INSERT INTO entries (word, definition, created_by) VALUES ($1, $2, $3) RETURNING id, word, definition, created_by, created_at, updated_at',
      [word, definition, createdBy]
    );
    return result.rows[0];
  }

  static async findAll(searchTerm = '') {
    let query = 'SELECT id, word, definition, created_at, updated_at FROM entries';
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
      'SELECT id, word, definition, created_by, created_at, updated_at FROM entries WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, word, definition) {
    const result = await db.query(
      'UPDATE entries SET word = $1, definition = $2, updated_at = NOW() WHERE id = $3 RETURNING id, word, definition, created_by, created_at, updated_at',
      [word, definition, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM entries WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Entry;
