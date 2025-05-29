const { UserModel } = require('../models');
const bcrypt = require('bcrypt');

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user object (without password)
   */
  async createUser(userData) {
    try {
      const { username, password, display_name, avatar } = userData;
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return await UserModel.create({
        username,
        password,
        display_name,
        avatar
      });
    } catch (error) {
      console.error('Error in createUser service:', error);
      throw error;
    }
  }

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async getUserById(id) {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      console.error('Error in getUserById service:', error);
      throw error;
    }
  }

  /**
   * Get a user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async getUserByUsername(username) {
    try {
      return await UserModel.findByUsername(username);
    } catch (error) {
      console.error('Error in getUserByUsername service:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUser(id, userData) {
    try {
      return await UserModel.update(id, userData);
    } catch (error) {
      console.error('Error in updateUser service:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - True if password was changed
   */
  async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      const verified = await UserModel.verifyCredentials(user.username, currentPassword);
      if (!verified) {
        throw new Error('Current password is incorrect');
      }
      return await UserModel.updatePassword(id, newPassword);
    } catch (error) {
      console.error('Error in changePassword service:', error);
      throw error;
    }
  }

  /**
   * Authenticate a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
   */
  async authenticateUser(username, password) {
    try {
      return await UserModel.verifyCredentials(username, password);
    } catch (error) {
      console.error('Error in authenticateUser service:', error);
      throw error;
    }
  }

  /**
   * Search users by username or display name
   * @param {string} query - Search query
   * @returns {Promise<Array>} - List of users matching the search query
   */
  async searchUsers(query) {
    try {
      return await UserModel.search(query);
    } catch (error) {
      console.error('Error in searchUsers service:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
