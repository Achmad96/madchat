const { createConnection, closeConnection } = require('../database');

class ParticipantModel {
  /**
   * Add a participant to a conversation
   * @param {Object} data - Participant data
   * @param {string} data.id - ID of the user to add
   * @param {string} data.conversationId - ID of the conversation
   * @returns {Promise<Object>} - Created participant record
   */
  static async create(data) {
    const db = await createConnection();
    try {
      const { id, conversationId } = data;
      const query = 'INSERT INTO participant (id, conversation_id) VALUES (?, ?)';
      await db.execute(query, [id, conversationId]);
      closeConnection(db);
      return data;
    } catch (error) {
      closeConnection(db);
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  /**
   * Find participants of a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} - Array of participants
   */
  static async findByConversationId(conversationId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute(
        `SELECT p.id AS participant_id,
        u.username,
        u.display_name,
        u.avatar
        FROM participant p
        INNER JOIN user u ON u.id = p.id
        WHERE p.conversation_id = ?`,
        [conversationId]
      );
      closeConnection(db);
      const participants = rows.map((row) => ({ ...row, id: row.participant_id, participant_id: undefined }));
      return participants;
    } catch (error) {
      closeConnection(db);
      console.error('Error finding conversation participants:', error);
      throw error;
    }
  }

  /**
   * Find conversations where a user is a participant
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of conversation IDs
   */
  static async findConversationsByUserId(userId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT conversation_id FROM participant WHERE id = ?', [userId]);
      closeConnection(db);
      return rows.map((row) => row.conversation_id);
    } catch (error) {
      closeConnection(db);
      console.error('Error finding user conversations:', error);
      throw error;
    }
  }

  /**
   * Check if a user is in a conversation
   * @param {string} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<boolean>} - True if user is in conversation, false otherwise
   */
  static async isUserInConversation(userId, conversationId) {
    const db = await createConnection();
    try {
      const [rows] = await db.execute('SELECT COUNT(*) AS count FROM participant WHERE id = ? AND conversation_id = ?', [userId, conversationId]);
      closeConnection(db);
      return rows[0].count > 0;
    } catch (error) {
      closeConnection(db);
      console.error('Error checking user in conversation:', error);
      throw error;
    }
  }

  /**
   * Remove a participant from a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if removal was successful
   */
  static async remove(conversationId, userId) {
    const db = await createConnection();
    try {
      const [result] = await db.execute('DELETE FROM participant WHERE conversation_id = ? AND id = ?', [conversationId, userId]);
      closeConnection(db);
      return result.affectedRows > 0;
    } catch (error) {
      closeConnection(db);
      console.error('Error removing participant:', error);
      throw error;
    }
  }
}

module.exports = ParticipantModel;
