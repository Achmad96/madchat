const { createConnection, closeConnection } = require('../database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user object
   */
  static async create(userData) {
    const db = await createConnection();
    try {
      const { username, password, display_name = null, avatar = null } = userData;
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();
      const query = `
        INSERT INTO user (id, username, password, display_name, avatar)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.execute(query, [userId, username, hashedPassword, display_name, avatar]);
      closeConnection(db);
      return this.findById(userId);
    } catch (error) {
      closeConnection(db);
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  static async findById(id) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT id, username, display_name, avatar, created_at, updated_at FROM user WHERE id = ?', [id]);
      closeConnection(db);
      return rows.length ? rows[0] : null;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  static async findByUsername(username) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT id, username, display_name, avatar, created_at, updated_at FROM user WHERE username = ?', [username]);
      closeConnection(db);

      return rows.length ? rows[0] : null;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Verify user credentials
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} - User object if credentials are valid, null otherwise
   */
  static async verifyCredentials(username, password) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT id, username, password AS hashed_password, display_name, avatar, created_at, updated_at FROM user WHERE username = ?', [username]);

      if (!rows.length) {
        return null;
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.hashed_password);
      if (!match) {
        return null;
      }
      const { hashed_password, ...userWithoutPassword } = user;
      closeConnection(db);
      return userWithoutPassword;
    } catch (error) {
      closeConnection(db);
      console.error('Error verifying credentials:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user object
   */
  static async update(id, userData) {
    const db = await createConnection();
    try {
      const { display_name, avatar } = userData;
      let query = 'UPDATE user SET updated_at = current_timestamp()';
      const params = [];
      if (display_name !== undefined) {
        query += ', display_name = ?';
        params.push(display_name);
      }
      if (avatar !== undefined) {
        query += ', avatar = ?';
        params.push(avatar);
      }
      query += ' WHERE id = ?';
      params.push(id);
      await db.execute(query, params);
      closeConnection(db);
      return this.findById(id);
    } catch (error) {
      closeConnection(db);
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - True if password was updated
   */
  static async updatePassword(id, newPassword) {
    const db = await createConnection();
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await db.execute('UPDATE user SET password = ?, updated_at = current_timestamp() WHERE id = ?', [hashedPassword, id]);
      closeConnection(db);
      return true;
    } catch (error) {
      closeConnection(db);
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - True if user was deleted
   */
  static async delete(id) {
    const db = await createConnection();
    try {
      const [result] = await db.execute('DELETE FROM user WHERE id = ?', [id]);
      closeConnection(db);
      return result.affectedRows > 0;
    } catch (error) {
      closeConnection(db);
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Search users by username or display name
   * @param {string} query - Search query
   * @returns {Promise<Array>} - List of matching users
   */
  static async search(query) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT id, username, display_name, avatar, created_at, updated_at FROM user WHERE username LIKE ? OR display_name LIKE ?', [`%${query}%`, `%${query}%`]);
      closeConnection(db);
      return rows;
    } catch (error) {
      closeConnection(db);
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

module.exports = UserModel;
