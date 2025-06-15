const JWT = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    console.log("JWT Secret:", JWT_SECRET_KEY);
    const token = req.cookies.token;

    // Validate token
    const decodedObj = JWT.verify(token, JWT_SECRET_KEY);
    console.log("Decoded Token:", decodedObj);

    const { userId } = decodedObj;

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};

module.exports = userAuth;
