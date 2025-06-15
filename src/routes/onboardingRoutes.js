const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const userAuth = require("../middlewares/auth");
const User = require("../models/user");
const Salary = require("../models/salary");
const LeaveBalance = require("../models/leaveBalanceSchema");
const calculateSalaryFromCTC = require("../utils/salaryCalculator"); // 👈 your salary calculator

router.post("/onboard", userAuth, async (req, res) => {
  try {
    const {
      // User fields
      name,
      email,      
      gender,
      phoneNumber,
      dob,
      maritalStatus,
      address,
      designation,
      joiningDate,

      // Optional fields
      skills,
      accessLevel,
      superiorId,
      subordinateIds,

      // Bank & PAN details
      bankName,
      accountNumber,
      panNumber,
      uanNumber,
      ifscCode,
      pfNumberOfEmployee,
      pfNumberOfEmployer,

      // CTC info
      ctc,
      includeGratuity,

      // Leave Info
      casualLeaves,
      sickLeaves,
      earnedLeaves
    } = req.body;

    const tenantId = req.user.tenantId;
    const userId = uuidv4();
    const defaultPassword = "Welcome@2025";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Step 1: Save user
    const user = new User({
      userId,
      name,      
      email,
      gender,
      phoneNumber,
      dob,
      maritalStatus,
      address,
      designation,
      joiningDate,
      skills,
      accessLevel,
      superiorId,
      subordinateIds,
      password: passwordHash,
      tenantId: tenantId
    });

    const savedUser = await user.save();

    // Step 2: Compute salary from CTC
    const {
      salaryStructure,
      totalEarnings,
      totalDeductions,
      netSalary,
      gratuity,
    } = calculateSalaryFromCTC(ctc, includeGratuity);

    // Step 3: Save salary
    const salary = new Salary({
      employeeId: savedUser._id,
      tenantId: tenantId,
      employeeName: name,
      bankName,
      accountNumber,
      panNumber,
      uanNumber,
      ifscCode,
      pfNumberOfEmployee,
      pfNumberOfEmployer,
      salaryStructure: {
        ...salaryStructure,
        gratuity,
      },
      totalEarnings,
      totalDeductions,
      netSalary,
    });

    await salary.save();

    // Step 4: Save leave balance
    const leave = new LeaveBalance({
      employeeId: savedUser._id,
      tenantId,
      casualLeaves: casualLeaves ?? 12,
      sickLeaves: sickLeaves ?? 8,
      earnedLeaves: earnedLeaves ?? 10,
    });

    await leave.save();

    // ✅ Final Response
    res.status(201).json({
      message: "User onboarded successfully",
      user: savedUser,
      credentials: {
        userId: savedUser.userId,
        email: savedUser.email,
        password: defaultPassword,
      },
    });

  } catch (error) {
    console.error("Onboarding Error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
