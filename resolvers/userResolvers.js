const User = require("../models/User");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendOTP");

const SUPPORT_EMAIL = "blissfortune222@gmail.com";

const userResolvers = {
  Query: {
    getMessages: async (_, { sessionId }) => {
      return await Message.find({ sessionId }).sort({ createdAt: 1 });
    },
  },

  Mutation: {
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
        otpExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      await user.save();
      await sendOTP(email, otp);

      return { message: "OTP sent to email, please verify", user };
    },

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

    signOut: async () => {
      return { message: "Sign out successful" };
    },

    sendMessage: async (_, { sessionId, email, content }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const from = email === SUPPORT_EMAIL ? "admin" : "user";

      const message = new Message({
        sessionId,
        from,
        email,        // ✅ now saving email in the message
        content,
      });

      await message.save();
      return message;
    },
  },
};

module.exports = userResolvers;
