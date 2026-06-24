const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent", "halfday"], required: true },
  checkIn: Date,
  checkOut: Date,
  ipAddress: String,
  deviceInfo: String,
  location: String,
});

const attendanceSchema = new mongoose.Schema({
  tenant:{type: String, ref: "Tenant", required:true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  month: { type: String, required: true }, // 0 = Jan, 11 = Dec
  year: { type: Number, required: true },
  records: [attendanceRecordSchema],
});

attendanceSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
