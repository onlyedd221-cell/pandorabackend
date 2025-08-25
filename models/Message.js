const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true }, // unique session (per user chat)
    from: { type: String, required: true },      // "user" or "support"
    email: { type: String, required: true },     // sender’s email
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
