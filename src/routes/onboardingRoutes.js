// routes/onboard.js
const express  = require("express");
const bcrypt   = require("bcryptjs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const userAuth        = require("../middlewares/auth");            // JWT auth
const checkPermission = require("../middlewares/checkPermission"); // RBAC
const User            = require("../models/user");
const Role            = require("../models/role");
const Salary          = require("../models/salary");
const LeaveBalance    = require("../models/leaveBalanceSchema");
const calcSalary      = require("../utils/salaryCalculator");

// POST /api/employees/onboard
router.post(
  "/onboard",
  userAuth,
  checkPermission("create_employee"),      // 👈 only HR / Admin etc. can hit this
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      /* ─── 1. Extract payload ─────────────────────────────── */
      const {
        // User core
        name,
        email,
        gender,
        phoneNumber,
        dob,
        maritalStatus,
        address,
        designation,
        joiningDate,
        //emergency contact
        emergencyContact,

        // Optional
        skills,
        superiorId,
        subordinateIds,

        // Role assignment
        roleId,        // 🆕 preferred (exact ObjectId string)
        roleSlug,      // 🆕 fallback if you pass "hr", "employee", etc.

        // Bank & PAN
        bankName,
        accountNumber,
        panNumber,
        uanNumber,
        ifscCode,
        pfNumberOfEmployee,
        pfNumberOfEmployer,

        // CTC
        ctc,
        includeGratuity,

        // Leave
        casualLeaves,
        sickLeaves,
        earnedLeaves,
      } = req.body;

      const tenantId = req.user.tenantId;
      const userId   = uuidv4();

      /* ─── 2. Resolve role (must belong to same tenant) ──── */
      let role;
      if (roleId) {
        role = await Role.findOne({ _id: roleId, tenantId }).session(session);
      } else if (roleSlug) {
        role = await Role.findOne({ slug: roleSlug, tenantId }).session(session);
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "roleId or roleSlug is required" });
      }

      if (!role) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: "Role not found for this tenant" });
      }

      /* ─── 3. Prevent duplicate email / phone ─────────────── */
      const dup = await User.findOne({
        tenantId,
        $or: [{ email }, { phoneNumber }],
      }).session(session);

      if (dup) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(409)
          .json({ error: "Email or phone already exists for this tenant" });
      }

      /* ─── 4. Create user ────────────────────────────────── */
      const defaultPassword = "Welcome@2025";
      const passwordHash    = await bcrypt.hash(defaultPassword, 10);

      const userDoc = await User.create(
        [
          {
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
            emergencyContact,
            skills,
            role: role._id,              // 🎯 reference to Role
            superiorId,
            subordinateIds,
            password: passwordHash,
            tenantId,
            firstLogin: true,
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      /* ─── 5. Salary calc & save ─────────────────────────── */
      const {
        salaryStructure,
        totalEarnings,
        totalDeductions,
        netSalary,
        gratuity,
      } = calcSalary(ctc, includeGratuity);

      await Salary.create(
        [
          {
            employeeId: userDoc._id,
            tenantId,
            employeeName: name,
            bankName,
            accountNumber,
            panNumber,
            uanNumber,
            ifscCode,
            pfNumberOfEmployee,
            pfNumberOfEmployer,
            salaryStructure: { ...salaryStructure, gratuity },
            totalEarnings,
            totalDeductions,
            netSalary,
          },
        ],
        { session }
      );

      /* ─── 6. Default leave balance ──────────────────────── */
      await LeaveBalance.create(
        [
          {
            employeeId: userDoc._id,
            tenantId,
            casualLeaves:  casualLeaves ?? 12,
            sickLeaves:    sickLeaves   ?? 8,
            earnedLeaves:  earnedLeaves ?? 10,
          },
        ],
        { session }
      );

      /* ─── 7. Commit & respond ───────────────────────────── */
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "User onboarded successfully",
        user: userDoc,
        credentials: {
          email: userDoc.email,
          password: defaultPassword, // show once
        },
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Onboard error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
);

module.exports = router;
