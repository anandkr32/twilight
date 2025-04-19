const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const userAuth = require("../middlewares/auth");
const {validateSignupData,  validateEditUserData } = require("../utils/validation"); // Fixed import

//api to get loggedin user
router.get("/getLoggedInUser", userAuth, async (req, res) => {
  try {
    const user = req.user; // already added by userAuth middleware
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// Read all users/employee
router.get("/getAllUsers", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// Create a new user/employee
router.post("/createUser", userAuth,  async (req, res) => {
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
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "Bad Request", error: error.message });
  }
});

// Read a user by ID
router.get("/users/:id", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 🔥 FIXED: Update a user by ID
router.patch("/updateUser/:userId",  userAuth, async (req, res) => {
  try {
    // if (!validateEditUserData(req)) {
    //   return res.status(400).json({ success: false, message: "Edit not allowed" });
    // }
    req.body.firstLogin = false;
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

// Delete a user by ID
router.delete("/deleteUser/:id",  userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const updatedUsers = await User.find().select("-password");
    res.status(200).json(updatedUsers);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
