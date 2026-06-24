const QRCode = require("qrcode");
const crypto = require("crypto");
const AttendanceSession = require("../models/attendanceSession");

exports.generateAttendanceSession = async (req, res) => {
  try {
    // 1. Generate a random secure session code
    const sessionCode = crypto.randomBytes(8).toString("hex");

    // 2. Set expiry (e.g., 2 months from now)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    expiresAt.setMonth(expiresAt.getMonth() + 2);

    // 3. Save session to DB
    const newSession = await AttendanceSession.create({
      sessionCode,
      createdBy: req.user._id, // Assuming admin is authenticated
      expiresAt,
      isActive: true,
    });

    // 4. Prepare QR Code data (URL or token)
    const qrData = `https://localhost:3000/markAttendance?code=${sessionCode}`;
    const qrImage = await QRCode.toDataURL(qrData); // base64 string

    // 5. Return QR and session info
    res.status(201).json({
      message: "QR Code Session Created",
      sessionCode,
      expiresAt,
      qrImage,
    });
  } catch (err) {
    console.error("QR Code Generation Failed:", err);
    res.status(500).json({ error: "Failed to create QR code session" });
  }
};
