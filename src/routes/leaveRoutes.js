const express = require("express");
const router = express.Router();
const User = require("../models/user");
const LeaveRequest = require("../models/leaveRequest");

// API to Get All Leave Requests
router.get("/getAllLeaveRequests", async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .populate("fromEmployeeId")
      .populate("toEmployeeId");
    res.status(200).json({ leaveRequests });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST API to send leave request to the manager
router.post("/sendLeaveRequest/:status/:toEmployeeId", async (req, res) => {
  try {
    const { fromEmployeeId, leaveType, fromDate, toDate, reason } = req.body;
    const toEmployeeId = req.params.toEmployeeId;
    const status = req.params.status;
    const leaveRequest = new LeaveRequest({
      fromEmployeeId,
      toEmployeeId,
      leaveType,
      fromDate,
      status,
      toDate,
      reason,
    });

    //check if connection request is sent to itself
    if (fromEmployeeId.toString() === toEmployeeId.toString()) {
      return res
        .status(404)
        .json({ message: "Can not send request to yourself" });
    }
    await leaveRequest.save();
    res.status(200).json({ leaveRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
