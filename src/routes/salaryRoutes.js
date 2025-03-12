const Salary = require("../models/salary");
const User = require("../models/user"); // Import User model
const calculateSalary = require("../utils/salaryCalculator");
const express = require("express");
const router = express.Router();

// Post API for generating Account Details
router.post("/createAccountDetails", async (req, res) => {
  try {
    const {employeeId, ifscCode, accountNumber, panNumber, uanNumber } = req.body;
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const accountDetails = new Salary({employeeId, ifscCode, accountNumber, panNumber, uanNumber }); // Fixed `ifscCode` to `ifsc`
    await accountDetails.save();
    res.status(200).json({ accountDetails });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate Salary Logic (Uncommented)
const generateSalary = async (req, res) => {
  try {
    const { userId, basic, hra, specialAllowance, professionalTax, incomeTax } = req.body;

    // Check if the user exists
    const employee = await User.findById(userId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Calculate salary
    const { totalEarnings, totalDeductions, netSalary } = calculateSalary(
      basic,
      hra,
      specialAllowance,
      professionalTax,
      incomeTax
    );

    // Save salary to database
    const salary = new Salary({
      employeeId: userId,
      basic,
      hra,
      specialAllowance,
      professionalTax,
      incomeTax,
      totalEarnings,
      totalDeductions,
      netSalary,
    });

    await salary.save();
    res.status(201).json({ success: true, message: "Salary generated successfully", salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = router;  // ✅ Correct export

