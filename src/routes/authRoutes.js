const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = uuidv4();
        user = new User({ userId, email, password: hashedPassword });
        await user.save();

        res.json({ msg: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('token', token, { httpOnly: true });

        const { password: userPassword, ...userWithoutPassword } = user.toObject();
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Protected Route (Example)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
