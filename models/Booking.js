const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    room: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String },
    notes: { type: String },
    paymentMethod: { type: String, required: true },
    sessionType: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to user
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
