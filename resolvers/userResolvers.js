const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTP = require('../utils/sendOTP');

const SUPPORT_EMAIL = "blissfortune222@gmail.com";

let messages = []; // In-memory for now. Replace with DB if needed.

const userResolvers = {
  Query: {
    // ✅ Get messages a user sent to admin
    getMessagesFromUser: async (_, { email }) => {
      return messages.filter(
        (msg) => msg.email === email && msg.from === "user"
      );
    },

    // ✅ Get messages admin sent to a user
    getMessagesFromAdmin: async (_, { email }) => {
      return messages.filter(
        (msg) => msg.email === email && msg.from === "admin"
      );
    },

    // ✅ Full conversation between a user and admin
    getConversation: async (_, { email }) => {
      return messages.filter((msg) => msg.email === email);
    },
  },

  Mutation: {
    // ✅ User registration
    register: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = String(Math.floor(100000 + Math.random() * 900000)).padStart(
        6,
        "0"
      );

      const user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpire: Date.now() + 10 * 60 * 1000,
      });

      await user.save();
      await sendOTP(email, otp);

      return { message: "OTP sent to email, please verify", user };
    },

    // ✅ Verify OTP
    verifyOTP: async (_, { email, otp }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (user.otp !== otp) throw new Error("Invalid OTP");
      if (user.otpExpire < Date.now()) throw new Error("OTP expired");

      user.otp = null;
      user.otpExpire = null;
      user.otpVerified = true;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return { message: "OTP verified successfully", token, user };
    },

    // ✅ Login
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (!user.otpVerified)
        throw new Error("Please register and verify your OTP before logging in");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Incorrect password");

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return { message: "Login successful", token, user };
    },

    // ✅ Sign out
    signOut: async () => {
      return { message: "Sign out successful" };
    },

    // ✅ User sends message → admin
    sendMessage: async (_, { email, content }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const message = {
        id: `${messages.length + 1}`,
        email, // links conversation to user email
        from: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      messages.push(message);
      return message;
    },

    // ✅ Admin sends message → user
    sendAdminMessage: async (_, { email, content }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const message = {
        id: `${messages.length + 1}`,
        email, // still ties to user’s email
        from: "admin",
        content,
        createdAt: new Date().toISOString(),
      };

      messages.push(message);
      return message;
    },
  },
};

module.exports = userResolvers;
