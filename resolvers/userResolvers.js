const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTP = require('../utils/sendOTP');

const SUPPORT_EMAIL = "admin302@gmail.com";

const userResolvers = {
  Query: {
    // ==========================
    // Fetch all chats (admin)
    // ==========================
    getAllChats: async () => {
      try {
        console.log("[DEBUG] getAllChats called");
        const users = await User.find({ email: { $ne: SUPPORT_EMAIL } });
        console.log("[DEBUG] Users fetched:", users);
        return users.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email
        }));
      } catch (err) {
        console.error("[ERROR] getAllChats failed:", err);
        throw err;
      }
    },

    // ==========================
    // Fetch messages for a chat
    // ==========================
    getMessages: async (_, { chatId }) => {
      try {
        console.log("[DEBUG] getMessages called with chatId:", chatId);
        if (!chatId) throw new Error("chatId is required");

        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
        console.log("[DEBUG] Messages found:", messages);

        return messages.map(m => ({
          id: m._id.toString(),
          chatId: m.chatId,
          from: m.from,
          type: m.type,
          content: m.content,
          timestamp: m.createdAt ? m.createdAt.getTime().toString() : Date.now().toString()
        }));
      } catch (err) {
        console.error("[ERROR] getMessages failed:", err);
        throw err;
      }
    },
  },

  Mutation: {
    // ==========================
    // Register user
    // ==========================
    register: async (_, { name, email, password }) => {
      try {
        console.log("[DEBUG] register called with:", { name, email });
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');

        const user = new User({
          name,
          email,
          password: hashedPassword,
        });

        await user.save();
        console.log("[DEBUG] User saved:", user);


        return { message: ' register Succesful:', user };
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
        console.log("[DEBUG] login called with email:", email);
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Incorrect password');

        const role = email === SUPPORT_EMAIL ? "admin" : "user";
        const token = jwt.sign(
          { id: user._id, email: user.email, role },
          process.env.JWT_SECRET,
           { expiresIn: "15m" }
        );
        console.log("[DEBUG] Login successful, JWT:", token);

        return { message: 'Login successful', token, user };
      } catch (err) {
        console.error("[ERROR] login failed:", err);
        throw err;
      }
    },

    // ==========================
    // Sign out
    // ==========================
    signOut: async () => {
      console.log("[DEBUG] signOut called");
      return { message: "Sign out successful" };
    },

    // ==========================
    // Send message
    // ==========================
    sendMessage: async (_, { chatId, from, type, content }) => {
      try {
        console.log("[DEBUG] sendMessage called:", { chatId, from, type, content });
        if (!chatId || !from || !type || !content) throw new Error("All fields are required");

        const message = new Message({
          chatId,
          from,
          type,
          content,
          createdAt: Date.now()
        });
        await message.save();
        console.log("[DEBUG] Message saved:", message);

        return {
          id: message._id.toString(),
          chatId: message.chatId,
          from: message.from,
          type: message.type,
          content: message.content,
          timestamp: message.createdAt.toString()
        };
      } catch (err) {
        console.error("[ERROR] sendMessage failed:", err);
        throw err;
      }
    }
  }
};

module.exports = userResolvers;
