const mongoose = require("mongoose");
const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    casualLeaves: { type: Number, default: 0 },
    annualLeaves: { type: Number, default: 0 },
    compOff: { type: Number, default: 0 },
    workFromHome: { type: Number, default: 0 },
    paternityLeave: { type: Number, default: 0 },
    maternityLeave: { type: Number, default: 0 },
    floatingLeave: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
module.exports = LeaveBalance;
