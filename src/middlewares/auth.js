const JWT = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    const token = req.cookies.token;
    // Validate token
    const decodedObj = JWT.verify(token, JWT_SECRET_KEY);
    const { userId } = decodedObj;

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user; // Attach user to request
    console.log("logged in user",user)
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized Access: " + err.message });
  }
};

module.exports = userAuth;
