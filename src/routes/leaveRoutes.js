const express = require("express");
const router = express.Router();
const User = require("../models/user");
const LeaveRequest = require("../models/leaveRequest");
const LeaveBalance = require('../models/leaveBalanceSchema')
const userAuth = require("../middlewares/auth")
// API to Get All Leave Requests
router.get("/getAllLeaveRequests", userAuth, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .populate("fromEmployeeId", "name")
      .populate("toEmployeeIds", "name");
    res.status(200).json({ leaveRequests });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// POST API to send leave request to the manager
router.post("/sendLeaveRequest/:status/:toEmployeeIds", userAuth, async (req, res) => {
  try {
    const { fromEmployeeId, leaveType, fromDate, toDate, reason } = req.body;
    const toEmployeeIds = req.params.toEmployeeIds.split(",");
    const status = req.params.status;

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      return res
        .status(400)
        .json({ message: "From date cannot be after To date" });
    }

    const numberOfDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const existingRequest = await LeaveRequest.findOne({
      fromEmployeeId,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          fromDate: { $lte: to },
          toDate: { $gte: from },
        },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "Leave request already applied for the selected dates",
        });
    }

    if (toEmployeeIds.includes(fromEmployeeId)) {
      return res
        .status(400)
        .json({ message: "Cannot send leave request to yourself" });
    }

    const leaveRequest = new LeaveRequest({
      fromEmployeeId,
      toEmployeeIds,
      leaveType,
      fromDate,
      toDate,
      reason,
      status,
      numberOfDays,
    });

    await leaveRequest.save();
    res.status(200).json({ leaveRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// PATCH API to approve a leave request
router.patch("/approveLeaveRequest/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const status = req.params.status;
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(
      requestId,
      { status: status },
      { new: true }
    )
      .populate("fromEmployeeId", "name")
      .populate("toEmployeeIds", "name");

    if (!updatedLeaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res
      .status(200)
      .json({ message: "Leave request approved", updatedLeaveRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;
