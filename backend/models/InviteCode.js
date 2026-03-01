const db = require('../db');
const crypto = require('crypto');

class InviteCode {
  static async create() {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const result = await db.query(
      'INSERT INTO invite_codes (code) VALUES ($1) RETURNING id, code, created_at, used_at, used_by',
      [code]
    );
    return result.rows[0];
  }

  static async findByCode(code) {
    const result = await db.query(
      'SELECT id, code, created_at, used_at, used_by FROM invite_codes WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  static async markUsed(code, userId) {
    const result = await db.query(
      'UPDATE invite_codes SET used_at = NOW(), used_by = $1 WHERE code = $2 RETURNING id, code, created_at, used_at, used_by',
      [userId, code]
    );
    return result.rows[0];
  }

  static async getAllCodes() {
    const result = await db.query(
      'SELECT id, code, created_at, used_at, used_by FROM invite_codes ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = InviteCode;
