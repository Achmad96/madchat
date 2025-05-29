const { ConversationModel, MessageModel, UserModel, ParticipantModel } = require('../models');

class ConversationService {
  /**
   * Create a new conversation between users
   * @param {Object} data - Conversation data
   * @param {string} data.creator_id - ID of the conversation creator
   * @param {Array<string>} data.participant_ids - IDs of participants to add
   * @returns {Promise<Object>} - Created conversation object
   */
  async createConversation(data) {
    try {
      const { type_id = 1, creator_id, participant_ids } = data;
      const creator = await UserModel.findById(creator_id);
      if (!creator) {
        throw new Error('Creator user does not exist');
      }
      const conversation = await ConversationModel.create({ typeId: type_id, creatorId: creator_id });
      await ParticipantModel.create({ id: creator_id, conversationId: conversation.id });
      if (type_id == 1) {
        if (participant_ids.length !== 1) {
          throw new Error('For private conversations, exactly one participant is required');
        }
        await ParticipantModel.create({ id: participant_ids[0], conversationId: conversation.id });
        return this.getConversationById(conversation.id, creator_id);
      }
      if (type_id == 3) {
        return this.getConversationById(conversation.id, creator_id);
      }
      // For group conversations, add all participants except the creator
      for (const participantId of participant_ids) {
        if (participantId === creator_id) {
          continue;
        }
        const participant = await UserModel.findById(participantId);
        if (!participant) {
          throw new Error(`Participant user with ID ${participantId} does not exist`);
        }
        await ParticipantModel.create({ id: participantId, conversationId: conversation.id });
      }
      return this.getConversationById(conversation.id, creator_id);
    } catch (error) {
      console.error('Error in createConversation service:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID with related user details
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Conversation ID
   * @returns {Promise<Object|null>} - Conversation with user details
   */
  async getConversationById(conversationId, userId) {
    try {
      const conversation = await ConversationModel.findById(conversationId, userId);
      if (!conversation) {
        return null;
      }
      return conversation;
    } catch (error) {
      console.error('Error in getConversationById service:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of conversations with latest messages
   */
  async getUserConversations(userId) {
    try {
      const conversations = await ConversationModel.findByUserId(userId);
      if (!conversations || conversations.length === 0) {
        return [];
      }
      return conversations;
    } catch (error) {
      console.error('Error in getUserConversations service:', error);
      throw error;
    }
  }

  /**
   * Create a new message in a conversation
   * @param {Object} data - Message data
   * @param {string} data.conversationId - ID of the conversation
   * @param {string} data.authorId - ID of the message sender
   * @param {string} data.content - Message content
   * @returns {Promise<Object>} - Created message object
   */
  async createMessage(data) {
    try {
      const { conversationId, authorId, content } = data;
      const conversation = await ConversationModel.findById(conversationId, authorId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      const participants = await ParticipantModel.findByConversationId(conversationId);
      const isParticipant = participants.some((participant) => participant.id === authorId);
      if (!isParticipant) {
        throw new Error('User is not part of this conversation');
      }
      return await MessageModel.create({ conversationId, authorId, content });
    } catch (error) {
      console.error('Error in createMessage service:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation with pagination
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages to retrieve
   * @param {number} offset - Number of messages to skip
   * @returns {Promise<Array>} - Array of messages
   */
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      return await MessageModel.findByConversationId(conversationId, limit, offset);
    } catch (error) {
      console.error('Error in getConversationMessages service:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation and all its messages
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - ID of user making the request (for authorization)
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  async deleteConversation(conversationId, userId) {
    try {
      const conversation = await ConversationModel.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const participants = await ParticipantModel.findByConversationId(conversationId);
      const isParticipant = participants.some((participant) => participant.id === userId);

      if (!isParticipant) {
        throw new Error('User not authorized to delete this conversation');
      }

      for (const participant of participants) {
        await ParticipantModel.remove(conversationId, participant.id);
      }

      return await ConversationModel.delete(id);
    } catch (error) {
      console.error('Error in deleteConversation service:', error);
      throw error;
    }
  }
}

module.exports = new ConversationService();
