const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      userId: uuidv4()
    });
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).send(userWithoutPassword);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a user by ID
router.get('/:id', authMiddleware,  async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a user by ID
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a user by ID
router.delete('/:id',authMiddleware,  async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
