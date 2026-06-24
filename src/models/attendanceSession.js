// models/AttendanceSession.js
const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema({
  sessionCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true, // allow long expiry e.g., 1-2 months
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
