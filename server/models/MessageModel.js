const { createConnection, closeConnection } = require('../database');
const { v4: uuidv4 } = require('uuid');

class MessageModel {
  /**
   * Create a new message
   * @param {Object} data - Message data
   * @param {string} data.conversationId - ID of the conversation
   * @param {string} data.content - Message content
   * @param {string} data.authorId - ID of the message author
   * @returns {Promise<Object>} - Created message object
   */
  static async create(data) {
    const db = await createConnection();
    try {
      const { conversationId, content, authorId } = data;
      const messageId = uuidv4();
      const query = `INSERT INTO message (id, conversation_id, author_id, content) VALUES (?, ?, ?, ?)`;
      await db.execute(query, [messageId, conversationId, authorId, content]);
      await db.execute('UPDATE conversation SET updated_at = current_timestamp() WHERE id = ?', [conversationId]);
      closeConnection(db);
      return this.findById(messageId);
    } catch (error) {
      closeConnection(db);
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Find message by ID
   * @param {string} id - Message ID
   * @returns {Promise<Object|null>} - Message object or null if not found
   */
  static async findById(id) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT m.id, conversation_id, content, author_id, u.username, u.display_name, u.avatar, m.created_at, m.updated_at 
          FROM message m
        INNER JOIN \`user\` u ON u.id = m.author_id
        WHERE m.id = ?`,
        [id]
      );
      closeConnection(db);
      return rows.length ? rows[0] : null;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding message by ID:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages to retrieve
   * @param {number} offset - Number of messages to skip
   * @returns {Promise<Array>} - Array of messages
   */
  static async findByConversationId(conversationId, limit = 50, offset = 0) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT id, conversation_id, content, author_id, created_at, updated_at 
          FROM message 
          WHERE conversation_id = ? 
          ORDER BY created_at ASC 
          LIMIT ? OFFSET ?`,
        [conversationId, limit, offset]
      );
      closeConnection(db);
      return rows;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding messages by conversation ID:', error);
      throw error;
    }
  }

  /**
   * Get the latest message for each conversation
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of latest messages with conversation details
   */
  static async getLatestMessagesForUser(userId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT m.*, c.id as conversation_id, u.username as author_username, u.display_name as author_display_name
          FROM message m
          JOIN conversation c ON m.conversation_id = c.id
          JOIN participants p ON c.id = p.conversation_id
          JOIN user u ON m.author_id = u.id
          WHERE m.id IN (
            SELECT MAX(id) FROM message
            GROUP BY conversation_id
          )
          AND p.user_id = ?
          ORDER BY m.created_at DESC`,
        [userId]
      );
      closeConnection(db);
      return rows;
    } catch (error) {
      closeConnection(db);
      console.error('Error getting latest messages for user:', error);
      throw error;
    }
  }

  /**
   * Update a message
   * @param {string} id - Message ID
   * @param {Object} data - Updated message data
   * @param {string} data.content - Updated message content
   * @returns {Promise<Object|null>} - Updated message or null if not found
   */
  static async update(id, data) {
    const db = await createConnection();
    try {
      const { content } = data;
      await db.execute('UPDATE message SET content = ?, updated_at = current_timestamp() WHERE id = ?', [content, id]);
      const [messageRows] = await db.execute('SELECT conversation_id FROM message WHERE id = ?', [id]);
      if (messageRows.length) {
        const { conversation_id } = messageRows[0];
        await db.execute('UPDATE conversation SET updated_at = current_timestamp() WHERE id = ?', [conversation_id]);
      }
      closeConnection(db);
      return this.findById(id);
    } catch (error) {
      closeConnection(db);
      console.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   * @param {string} id - Message ID
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  static async delete(id) {
    const db = await createConnection();
    try {
      const [messageRows] = await db.execute('SELECT conversation_id FROM message WHERE id = ?', [id]);
      const [result] = await db.execute('DELETE FROM message WHERE id = ?', [id]);
      if (result.affectedRows > 0 && messageRows.length) {
        const { conversation_id } = messageRows[0];
        await db.execute('UPDATE conversation SET updated_at = current_timestamp() WHERE id = ?', [conversation_id]);
      }
      closeConnection(db);
      return result.affectedRows > 0;
    } catch (error) {
      closeConnection(db);
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Count messages in a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<number>} - Count of messages
   */
  static async countByConversationId(conversationId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM message WHERE conversation_id = ?', [conversationId]);
      closeConnection(db);
      return rows[0].count;
    } catch (error) {
      closeConnection(db);
      console.error('Error counting messages:', error);
      throw error;
    }
  }
}

module.exports = MessageModel;
