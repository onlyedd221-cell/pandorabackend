const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SUPPORT_EMAIL = "admin302@gmail.com";

const userResolvers = {
  Query: {
    // ==========================
    // Fetch all active chats
    // ==========================
    getAllChats: async () => {
      try {
        console.log("[DEBUG] getAllChats called");
        const users = await User.find({ email: { $ne: SUPPORT_EMAIL }, archived: false });
        return users.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          archived: !!u.archived,
        }));
      } catch (err) {
        console.error("[ERROR] getAllChats failed:", err);
        throw err;
      }
    },

    // ==========================
    // Fetch archived chats
    // ==========================
    getArchivedChats: async () => {
      try {
        console.log("[DEBUG] getArchivedChats called");
        const users = await User.find({ email: { $ne: SUPPORT_EMAIL }, archived: true });
        return users.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          archived: true,
        }));
      } catch (err) {
        console.error("[ERROR] getArchivedChats failed:", err);
        throw err;
      }
    },

    // ==========================
    // Fetch messages
    // ==========================
    getMessages: async (_, { chatId }) => {
      try {
        if (!chatId) throw new Error("chatId is required");

        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

        return messages.map(m => ({
          id: m._id.toString(),
          chatId: m.chatId,
          from: m.from,
          type: m.type,
          content: m.content,
          timestamp: m.createdAt ? m.createdAt.getTime().toString() : Date.now().toString(),
        }));
      } catch (err) {
        // console.error("[ERROR] getMessages failed:", err);
        throw err;
      }
    },
  },

  Mutation: {
    // ==========================
    // Register
    // ==========================
    register: async (_, { name, email, password }) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword, archived: false });
        await user.save();

        const role = email === SUPPORT_EMAIL ? "admin" : "user";
        const token = jwt.sign(
          { id: user._id, email: user.email, role },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        return { message: "Register successful", token, user };
      } catch (err) {
        console.error("[ERROR] register failed:", err);
        throw err;
      }
    },

    // ==========================
    // Login
    // ==========================
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        const role = email === SUPPORT_EMAIL ? "admin" : "user";
        const token = jwt.sign(
          { id: user._id, email: user.email, role },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        return { message: "Login successful", token, user };
      } catch (err) {
        console.error("[ERROR] login failed:", err);
        throw err;
      }
    },

    // ==========================
    // Sign out
    // ==========================
    signOut: async () => {
      return { message: "Sign out successful" };
    },

    // ==========================
    // Send message
    // ==========================
    sendMessage: async (_, { chatId, from, type, content }) => {
      try {
        if (!chatId || !from || !type || !content) {
          throw new Error("All fields are required");
        }

        const message = new Message({ chatId, from, type, content });
        await message.save();

        return {
          id: message._id.toString(),
          chatId: message.chatId,
          from: message.from,
          type: message.type,
          content: message.content,
          timestamp: message.createdAt.getTime().toString(),
        };
      } catch (err) {
        console.error("[ERROR] sendMessage failed:", err);
        throw err;
      }
    },

    // ==========================
    // Archive chat
    // ==========================
    archiveChat: async (_, { chatId }) => {
      try {
        const user = await User.findByIdAndUpdate(chatId, { archived: true }, { new: true });
        if (!user) throw new Error("Chat not found");
        return { message: "Chat archived successfully" };
      } catch (err) {
        console.error("[ERROR] archiveChat failed:", err);
        throw err;
      }
    },

    // ==========================
    // Unarchive chat
    // ==========================
    unarchiveChat: async (_, { chatId }) => {
      try {
        const user = await User.findByIdAndUpdate(chatId, { archived: false }, { new: true });
        if (!user) throw new Error("Chat not found");
        return { message: "Chat unarchived successfully" };
      } catch (err) {
        console.error("[ERROR] unarchiveChat failed:", err);
        throw err;
      }
    },
  },
};

module.exports = userResolvers;
