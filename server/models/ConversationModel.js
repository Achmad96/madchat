const { createConnection, closeConnection } = require('../database');
const { v4: uuidv4 } = require('uuid');

class ConversationModel {
  /**
   * Create a new conversation between two users
   * @param {Object} data - Conversation data
   * @param {string} data.creatorId - ID of the creator
   * @returns {Promise<Object>} - Created conversation object
   */
  static async create(data) {
    const db = await createConnection();
    try {
      const { typeId, creatorId } = data;
      const conversationId = uuidv4();
      const query = 'INSERT INTO conversation (id, type_id, creator_id) VALUES (?, ?, ?)';
      const result = await db.execute(query, [conversationId, typeId, creatorId]);
      closeConnection(db);
      return {
        id: conversationId,
        type_id: typeId,
        creator_id: creatorId
      };
    } catch (error) {
      closeConnection(db);
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Find conversation by ID
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Conversation object or null if not found
   */
  static async findById(conversationId, userId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT c.id AS conversation_id, c.type_id, creator_id, c.created_at, c.updated_at,
        p.id, u.username, u.display_name, u.avatar
        FROM participant p
        INNER JOIN conversation c ON p.conversation_id = c.id
        INNER JOIN user u ON p.id = u.id
        WHERE c.id IN (SELECT p.conversation_id FROM participant p WHERE p.id = ?)
        AND c.id = ?`,
        [userId, conversationId]
      );
      closeConnection(db);
      const conversation = rows.reduce((acc, row) => {
        if (!acc) {
          acc = {
            id: row.conversation_id,
            type_id: row.type_id,
            creator_id: row.creator_id,
            recipients: [],
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        }
        if (row.id !== userId) {
          acc.recipients.push({
            id: row.id,
            username: row.username,
            display_name: row.display_name,
            avatar: row.avatar
          });
        }
        return acc;
      }, null);
      return rows.length ? conversation : null;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding conversation by ID:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   * @param {string} userId - user ID of one participant
   * @returns {Promise<Array>} - Conversation object or null if not found
   */
  static async findByUserId(userId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT c.id AS conversation_id, c.type_id, creator_id, c.created_at, c.updated_at,
                p.id, u.username, u.display_name, u.avatar
        FROM participant p
        INNER JOIN conversation c ON p.conversation_id = c.id
        INNER JOIN user u ON p.id = u.id
        WHERE c.id IN (SELECT p.conversation_id FROM participant p WHERE p.id = ?)`,
        [userId]
      );
      closeConnection(db);
      if (!rows.length) return null;
      const conversations = rows.reduce((acc, row) => {
        let convo = acc.find((c) => c.id === row.conversation_id);
        if (!convo) {
          convo = {
            id: row.conversation_id,
            type_id: row.type_id,
            creator_id: row.creator_id,
            recipients: [],
            created_at: row.created_at,
            updated_at: row.updated_at
          };
          acc.push(convo);
        }
        if (row.id === userId) return acc; // Skip the user themselves
        convo.recipients.push({
          id: row.id,
          username: row.username,
          display_name: row.display_name,
          avatar: row.avatar
        });
        return acc;
      }, []);
      return conversations.length ? conversations : null;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding conversation by participants:', error);
      throw error;
    }
  }

  /**
   * Update conversation's updated_at timestamp
   * @param {string} id - Conversation ID
   * @returns {Promise<boolean>} - True if update was successful
   */
  static async updateTimestamp(id) {
    const db = await createConnection();
    try {
      await db.execute('UPDATE conversation SET updated_at = current_timestamp() WHERE id = ?', [id]);
      closeConnection(db);
      return true;
    } catch (error) {
      closeConnection(db);
      console.error('Error updating conversation timestamp:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation and all its messages
   * @param {string} id - Conversation ID
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  static async delete(id) {
    const db = await createConnection();
    try {
      await db.execute('DELETE FROM message WHERE conversation_id = ?', [id]);
      const [result] = await db.execute('DELETE FROM conversation WHERE id = ?', [id]);
      closeConnection(db);
      return result.affectedRows > 0;
    } catch (error) {
      closeConnection(db);
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Get the list of conversations for a user with pagination
   * @param {string} userId - User ID
   * @param {number} limit - Number of conversations to return
   * @param {number} offset - Offset for pagination
   * @return {Promise<Array>} - Array of conversations
   */
  static async getConversationsWithPagination(userId, limit = 50, offset = 0) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT c.id, c.sender_id, c.recipient_id, c.created_at, c.updated_at,
          u1.username as sender_username, u1.display_name as sender_display_name, u1.avatar as sender_avatar,
          u2.username as recipient_username, u2.display_name as recipient_display_name, u2.avatar as recipient_avatar
          FROM conversation c
          JOIN user u1 ON c.sender_id = u1.id
          JOIN user u2 ON c.recipient_id = u2.id
          WHERE c.sender_id = ? OR c.recipient_id = ?
          ORDER BY c.updated_at DESC, c.created_at DESC
          LIMIT ? OFFSET ?`,
        [userId, userId, limit, offset]
      );
      closeConnection(db);
      return rows;
    } catch (error) {
      closeConnection(db);
      console.error('Error getting conversations with pagination:', error);
      throw error;
    }
  }
}

module.exports = ConversationModel;
