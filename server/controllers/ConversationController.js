const { ConversationService } = require("../services");
const { ParticipantModel } = require("../models");
const { response } = require("../utils/ResponseUtil");

/**
 * Create a new conversation
 */
const createConversation = async (req, res) => {
  try {
    const { participant_ids } = req.body;
    const creator_id = req.user.id;

    if (!participant_ids || !participant_ids.length) {
      return response(res, 400, "At least one participant is required");
    }

    const conversation = await ConversationService.createConversation({ creator_id, participant_ids });
    const io = req.app.get("io");
    const allParticipants = [creator_id, ...participant_ids];

    for (const participantId of allParticipants) {
      const userConversations = await ConversationService.getUserConversations(participantId);
      io.emit(`new-conversation-${participantId}`, userConversations);
    }

    response(res, 201, "Conversation created successfully", conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    response(res, 500, "Failed to create conversation");
  }
};

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const conversation = await ConversationService.getConversationById(id, userId);
    if (!conversation) {
      return response(res, 404, "Conversation not found");
    }
    response(res, 200, "Conversation retrieved successfully", conversation);
  } catch (error) {
    console.error("Error getting conversation by ID:", error);
    response(res, 500, "Failed to get conversation");
  }
};

/**
 * Get conversations for the current user
 */
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await ConversationService.getUserConversations(userId);
    if (!conversations || conversations.length === 0) {
      return response(res, 404, "No conversations found for this user");
    }
    return response(res, 200, "User conversations retrieved successfully", conversations);
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return response(res, 500, "Failed to get conversations");
  }
};

/**
 * Send a message in a conversation
 */
const sendMessage = async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const author_id = req.user.id;

    if (!conversation_id || !content) {
      return response(res, 400, "conversation_id and content are required");
    }

    const message = await ConversationService.createMessage({
      conversationId: conversation_id,
      authorId: author_id,
      content
    });

    const io = req.app.get("io");
    io.emit(`new-message-${conversation_id}`, message);

    const participants = await ParticipantModel.findByConversationId(conversation_id);
    const otherParticipants = participants.filter((participant) => participant.participant_id !== author_id);

    for (const participant of otherParticipants) {
      io.emit(`new-notification-${participant.id}`, message);
    }

    response(res, 201, "Message sent successfully", message);
  } catch (error) {
    console.error("Error sending message:", error);
    response(res, 500, "Failed to send message");
  }
};

/**
 * Get messages for a conversation
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await ConversationService.getConversationMessages(conversationId);
    response(res, 200, "Messages retrieved successfully", messages);
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    response(res, 500, "Failed to get messages");
  }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await ConversationService.deleteConversation(conversationId, userId);
    response(res, 200, "Conversation deleted successfully");
  } catch (error) {
    console.error("Error deleting conversation:", error);
    response(res, 500, "Failed to delete conversation");
  }
};

module.exports = {
  createConversation,
  getConversationById,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  deleteConversation
};
