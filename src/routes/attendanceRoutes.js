const express = require("express");
const router = express.Router();
const { generateAttendanceSession } = require("../controllers/attendanceController");
const userAuth  = require("../middlewares/auth"); 
const checkPermission = require("../middlewares/checkPermission")
const {markAttendance}  = require("../controllers/markAttendance");
// Only admins can generate QR code sessions
router.post(
  "/generateSession",
  userAuth,
  checkPermission("generate_qr_code"),
  generateAttendanceSession
);

router.post("/markAttendance", userAuth, markAttendance);

module.exports = router;
