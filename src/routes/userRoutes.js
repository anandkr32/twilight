const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
// const validateSignupData = require("../utils/validation")

// Read all users/employee
router.get("/getAllUsers", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Create a new user/employee
router.post("/createUser", async (req, res) => {
  try {
    // validateSignupData(req);
    const {
      name,
      email,
      password,
      phoneNumber,
      designation,
      dob,
      address,
      joiningDate,
    } = req.body;
    // const passworHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phoneNumber,
      // password: passworHash,
      userId: uuidv4(),
      designation,
      dob,
      address,
      joiningDate,
    });
    await user.save();
    // const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});



// Read a user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a user by ID
router.patch("/users/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a user by ID
router.delete("/deleteUser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updatedUsers = await User.find().select("-password");

    res.status(200).json({ success: true, updatedUsers });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
});



module.exports = router;
