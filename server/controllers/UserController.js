const UserService = require("../services/UserService");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../configs/jwt");

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  try {
    const { username, password, display_name } = req.body;
    const avatar = req.file ? req.file.buffer : null;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await UserService.createUser({ username, password, display_name, avatar });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.message === "Username already exists") {
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Failed to register user" });
  }
};

/**
 * Authenticate a user and generate token
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await UserService.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "24h" });
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to login: " + error.message });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name } = req.body;
    const avatar = req.file ? req.file.buffer : undefined;
    const updatedUser = await UserService.updateUser(userId, {
      display_name,
      avatar
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    await UserService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.message === "Current password is incorrect") {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    res.status(500).json({ error: "Failed to change password" });
  }
};

/**
 * Search for users by username
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) {
      return res.status(400).json({ error: "Search query must be at least 3 characters" });
    }
    const users = await UserService.searchUsers(query);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
};

/**
 * Get user avatar
 */
const getUserAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getUserById(userId);
    if (!user || !user.avatar) {
      return res.status(404).sendFile(path.join(__dirname, "../assets/default-avatar.png"));
    }
    res.set("Content-Type", "image/jpeg");
    res.send(user.avatar);
  } catch (error) {
    console.error("Error getting user avatar:", error);
    res.status(500).json({ error: "Failed to get user avatar" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  searchUsers,
  getUserAvatar
};
