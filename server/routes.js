const express = require('express');
const multer = require('multer');
const { UserController, ConversationController } = require('./controllers');
const authenticateToken = require('./middleware/authenticateToken');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auth routes
router.post('/auth/register', upload.single('avatar'), UserController.registerUser);
router.post('/auth/login', UserController.loginUser);

// User routes (protected)
router.get('/users/profile', authenticateToken, UserController.getUserProfile);
router.put('/users/profile', authenticateToken, upload.single('avatar'), UserController.updateUserProfile);
router.put('/users/change-password', authenticateToken, UserController.changePassword);
router.get('/users/search', authenticateToken, UserController.searchUsers);
router.get('/users/:id/avatar', UserController.getUserAvatar);
router.get('/users/:id', authenticateToken, UserController.getUserProfile);

// Conversation routes (protected)
router.get('/conversations', authenticateToken, ConversationController.getUserConversations);
router.post('/conversations', authenticateToken, ConversationController.createConversation);
router.get('/conversations/:id', authenticateToken, ConversationController.getConversationById);
router.delete('/conversations/:id', authenticateToken, ConversationController.deleteConversation);

// Message routes (protected)
router.post('/messages', authenticateToken, ConversationController.sendMessage);
router.get('/conversations/:conversationId/messages', authenticateToken, ConversationController.getConversationMessages);

module.exports = router;
