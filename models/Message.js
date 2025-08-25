const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true }, // identifier for the chat (can be user's id or email)
    from: { type: String, enum: ["user", "admin"], required: true }, // sender type
    content: { type: String, required: true }, // message content (text or image URL)
    type: { type: String, enum: ["text", "image"], default: "text" }, // message type
  },
  { timestamps: true } // createdAt and updatedAt
);

module.exports = mongoose.model("Message", messageSchema);
