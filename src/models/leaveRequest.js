const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  fromEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toEmployeeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming this is the approver/manager
    required: true
  }],
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant',
  },
  leaveType: {
    type: String,
    enum: ["casual", "sick", "earned", "maternity", "paternity", "unpaid","outdoor","work from home"],
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  numberOfDays:{
    type:Number,
    
  },

  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  comment: {
    type: String, // Manager's comment
    trim: true
  }
}, {
  timestamps: true
});

// Optional: Prevent duplicate leave requests for exact same date range
leaveRequestSchema.index({ fromEmployeeId: 1, fromDate: 1, toDate: 1 }, { unique: false });

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
module.exports = LeaveRequest;
