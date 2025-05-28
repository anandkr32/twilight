const express = require("express");
const router = express.Router();
const User = require("../models/user");
const LeaveRequest = require("../models/leaveRequest");
const LeaveBalance = require("../models/leaveBalanceSchema");
const userAuth = require("../middlewares/auth"); // Optional if you want to protect the route

// @route   POST /api/leave-balance/create
// @desc    Create leave balance for a new user
// @access  Public or Private (based on your app logic)
router.post("/createLeaveBalance", async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res
      .status(400)
      .json({ success: false, message: "employeeId is required." });
  }

  try {
    const existing = await LeaveBalance.findOne({ employeeId: employeeId });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Leave balance already exists." });
    }

    const leaveBalance = new LeaveBalance({
      employeeId: employeeId,
      casualLeaves: 10,
      annualLeaves: 15,
      compOff: 0,
      workFromHome: 0,
      paternityLeave: 5,
      maternityLeave: 0,
      floatingLeave: 2,
    });

    await leaveBalance.save();
    res.status(201).json({ success: true, leaveBalance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/getLeaveBalance/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      res.status(400).json({ success: false, message: "Employee id missing" });
    }
    const leaveBalance = await LeaveBalance.findOne({
      employeeId: employeeId,
    }).populate("employeeId", "name email");
    if (!leaveBalance) {
      return res
        .status(404)
        .json({ success: false, message: "Leave balance not found" });
    }

    res.status(200).json({ success: true, leaveBalance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
