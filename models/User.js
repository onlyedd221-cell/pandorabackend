const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // store archived chat user IDs
  // otp: { type: String },
  // otpExpire: { type: Date },
  // otpVerified: { type: Boolean, default: false }
  archived: { type: Boolean, default: false }, 
});

module.exports = mongoose.model('User', userSchema);
