const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, is_contributor) VALUES ($1, $2, $3) RETURNING id, email, is_contributor',
      [email, hashedPassword, false]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, email, is_contributor, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getAllUsers() {
    const result = await db.query('SELECT id, email, is_contributor, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async setContributor(userId, status) {
    const result = await db.query(
      'UPDATE users SET is_contributor = $1 WHERE id = $2 RETURNING id, email, is_contributor',
      [status, userId]
    );
    return result.rows[0];
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, is_contributor: user.is_contributor },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

module.exports = User;
