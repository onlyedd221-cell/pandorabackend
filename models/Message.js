const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },   // user’s email → chat identifier
    from: { type: String, enum: ["user", "admin"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
