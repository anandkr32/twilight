const Attendance = require("../models/attendance");
const moment = require("moment");

exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const currentDate = moment(); // today
    const dateStr = currentDate.format("YYYY-MM-DD");

    const status = req.body.status || "present"; // "present", "absent", "halfday"
    const checkIn = new Date(); // or req.body.checkIn
    const ipAddress = req.ip;
    const deviceInfo = req.headers["user-agent"];
    const location = req.body.location || "Unknown";
    const tenantId = req.user.tenantId;
    console.log("tenant id",tenantId)
    const month = currentDate.format("MMMM"); // 0-based
    const year = currentDate.year();

    let attendance = await Attendance.findOne({ user: userId, month, year });

    if (!attendance) {
      attendance = new Attendance({
        tenant:tenantId,
        user: userId,
        month,
        year,
        records: [],
      });
    }

    // Check if today's record already exists
    const existingIndex = attendance.records.findIndex(
      (r) => moment(r.date).format("YYYY-MM-DD") === dateStr
    );

    if (existingIndex !== -1) {
      // Update existing record
      attendance.records[existingIndex] = {
        ...attendance.records[existingIndex]._doc,
        status,
        checkIn,
        ipAddress,
        deviceInfo,
        location,
      };
    } else {
      // Add new record
      attendance.records.push({
        date: currentDate.toDate(),
        status,
        checkIn,
        ipAddress,
        deviceInfo,
        location,
      });
    }

    await attendance.save();

    res.status(200).json({ message: "Attendance marked successfully", attendance });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};
