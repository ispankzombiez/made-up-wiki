const db = require('../db');

class EntryHistory {
  static async create(entryId, word, partOfSpeech, pronunciation, definition, example, relatedWords, categories, changedBy, changeDescription) {
    const result = await db.query(
      `INSERT INTO entry_history 
       (entry_id, word, part_of_speech, pronunciation, definition, example, related_words, categories, changed_by, change_description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [entryId, word, partOfSpeech, pronunciation, definition, example, relatedWords, categories, changedBy, changeDescription]
    );
    return result.rows[0];
  }

  static async getHistoryByEntryId(entryId) {
    const result = await db.query(
      `SELECT 
        h.id,
        h.entry_id,
        h.word,
        h.part_of_speech,
        h.pronunciation,
        h.definition,
        h.example,
        h.related_words,
        h.categories,
        h.changed_by,
        COALESCE(u.username, 'Unknown') as changed_by_username,
        h.change_description,
        h.created_at
      FROM entry_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.entry_id = $1
      ORDER BY h.created_at DESC`,
      [entryId]
    );
    return result.rows;
  }

  static async getHistoryRecord(historyId) {
    const result = await db.query(
      `SELECT 
        h.id,
        h.entry_id,
        h.word,
        h.part_of_speech,
        h.pronunciation,
        h.definition,
        h.example,
        h.related_words,
        h.categories,
        h.changed_by,
        COALESCE(u.username, 'Unknown') as changed_by_username,
        h.change_description,
        h.created_at
      FROM entry_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.id = $1`,
      [historyId]
    );
    return result.rows[0];
  }

  static async deleteByEntryId(entryId) {
    const result = await db.query('DELETE FROM entry_history WHERE entry_id = $1', [entryId]);
    return result.rowCount;
  }
}

module.exports = EntryHistory;
