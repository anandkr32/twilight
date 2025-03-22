const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const User = require("../models/user");

const router = express.Router();

// Signup Route

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password,  } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    user = new User({ userId, name, email, password: hashedPassword, firstLogin: true });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    const { password: userPassword, ...userWithoutPassword } = user.toObject();
    if (user.firstLogin) {
      return res.json({ firstLogin: true, token, user: userWithoutPassword });
    } 
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

//Logout API
router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ msg: "Logout Successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong while logging out" });
  }
});

module.exports = router;
