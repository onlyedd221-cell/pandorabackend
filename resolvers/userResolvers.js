const User = require('../models/User');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
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
 

    // ==========================
    // Admin: get bookings for a specific user
    // ==========================
    getUserBookings: async (_, { userId }, { user }) => {
      if (!user) throw new Error("Admin access required");
      if (!userId) throw new Error("userId is required");

      const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
      return bookings.map(b => ({
        id: b._id.toString(),
        userId: b.userId.toString(),
        name: b.name,
        phone: b.phone,
        email: b.email,
        room: b.room,
        date: b.date,
        time: b.time,
        duration: b.duration,
        notes: b.notes,
        paymentMethod: b.paymentMethod,
        sessionType: b.sessionType,
        createdAt: b.createdAt.toISOString(),
      }));
    },

  

  },

  Mutation: {
    // ==========================
    // Register
    // ==========================
    register: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, archived: false });
      await user.save();

      const role = email === SUPPORT_EMAIL ? "admin" : "user";
      const token = jwt.sign({ id: user._id, email: user.email, role }, process.env.JWT_SECRET, { expiresIn: "15m" });

      return { message: "Register successful", token, user };
    },

    // ==========================
    // Login
    // ==========================
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Incorrect password");

      const role = email === SUPPORT_EMAIL ? "admin" : "user";
      const token = jwt.sign({ id: user._id, email: user.email, role }, process.env.JWT_SECRET, { expiresIn: "15m" });

      return { message: "Login successful", token, user };
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
    sendMessage: async (_, { chatId, from, type, content }, { user }) => {
      if (!user) throw new Error("Authentication required");
      if (!chatId || !from || !type || !content) throw new Error("All fields are required");

      const message = new Message({ chatId, from, type, content });
      await message.save();

      return {
        id: message._id.toString(),
        chatId: message.chatId,
        from: message.from,
        type: message.type,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
      };
    },

    // ==========================
    // Archive chat
    // ==========================
    archiveChat: async (_, { chatId }, { user }) => {
      if (!user || user.email !== SUPPORT_EMAIL) throw new Error("Admin access required");

      const updated = await User.findByIdAndUpdate(chatId, { archived: true }, { new: true });
      if (!updated) throw new Error("Chat not found");
      return { message: "Chat archived successfully" };
    },

    // ==========================
    // Unarchive chat
    // ==========================
    unarchiveChat: async (_, { chatId }, { user }) => {
      if (!user || user.email !== SUPPORT_EMAIL) throw new Error("Admin access required");

      const updated = await User.findByIdAndUpdate(chatId, { archived: false }, { new: true });
      if (!updated) throw new Error("Chat not found");
      return { message: "Chat unarchived successfully" };
    },

    // ==========================
    // User: create booking
    // ==========================
  // ==========================
// User: create booking
// ==========================
createBooking: async (
  _,
  {
    name,
    phone,
    email,
    room,
    date,
    time,
    duration,
    notes,
    paymentMethod,
    sessionType,
  },
  { user } // JWT context
) => {
  if (!user) throw new Error("Authentication required");

  // Create new booking linked to the logged-in user's ID
  const booking = new Booking({
    userId: user.id,
    name,
    phone,
    email,
    room,
    date,
    time,
    duration,
    notes,
    paymentMethod,
    sessionType,
    createdAt: new Date(),
  });

  await booking.save();

  // Return in the same structure as getUserBookings
  return {
    id: booking._id.toString(),
    userId: booking.userId.toString(),
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    room: booking.room,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    notes: booking.notes,
    paymentMethod: booking.paymentMethod,
    sessionType: booking.sessionType,
    createdAt: booking.createdAt.toISOString(),
  };
}

  },
};

module.exports = userResolvers;
