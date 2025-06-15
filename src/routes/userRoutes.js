const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const userAuth = require("../middlewares/auth");

const upload = require("../middlewares/multer");
const {
  validateSignupData,
  validateEditUserData,
} = require("../utils/validation"); // Fixed import

//api to get loggedin user
router.get("/getLoggedInUser", userAuth, async (req, res) => {
  try {
    const user = req.user; // already added by userAuth middleware
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});


// Read all users/employees belonging to the same tenant
router.get("/getAllUsers", userAuth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant ID is missing in authenticated user" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch users by tenantId
    const users = await User.find({ tenantId })
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ tenantId });

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


// Create a new user/employee
router.post("/createUser", userAuth, async (req, res) => {
  try {
    // validateSignupData(req);
    const {
      name,
      email,
      gender,
      phoneNumber,
      designation,
      dob,
      address,
      joiningDate,
      tenantId
    } = req.body;
    // const passworHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const defaultPassword = "Welcome@2025"; // You can make this configurable
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const user = new User({
      name,
      email,
      gender,
      phoneNumber,
      password: passwordHash,
      userId,
      designation,
      dob,
      address,
      joiningDate,
      tenantId
    });

    await user.save();
    res.status(201).json({
      message: "User created successfully",
      user:user,
      credentials: {        
        userId: user.userId,
        email: user.email,
        password: defaultPassword, // ⚠️ Only return this in dev or secure admin-only route
      },
    });
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// 🔥 FIXED: Update a user by ID
router.patch("/updateUser/:userId", userAuth, async (req, res) => {
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

// Delete a user by ID
router.delete("/deleteUser/:id", userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select(
      "-password"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updatedUsers = await User.find().select("-password");
    res.status(200).json(updatedUsers);
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});

//uplaod profile picture

// Example route
router.post(
  "/upload-profile",
  userAuth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const imageUrl = req.file.path;
      const userId = req.user._id; // Comes from token
      console.log("Uploaded file info:", req.file);
      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: imageUrl },
        { new: true }
      ).select("-password");
      console.log("user with profile picture", user);

      res.json({ success: true, imageUrl, user });
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({ success: false, message: "Image upload failed" });
    }
  }
);

//Patch APi to change profile picture
router.patch(
  "/upload-profile/:userId",
  userAuth,
  upload.single("profilePicture"),
  async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
      const imageUrl = req.file.path;
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { profilePicture: imageUrl },
        { new: true }
      ).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "Profile picture uploaded", user });
    } catch (error) {
      console.error("Upload failed:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Image upload failed",
          error: error.message,
        });
    }
  }
);

module.exports = router;
