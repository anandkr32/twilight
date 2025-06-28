// controllers/tenantController.js
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const Tenant = require("../models/tenant");
const User   = require("../models/user");
const Role   = require("../models/role");

const seedRolesForTenant = require("../utils/seedRolesForTenant"); // idempotent seeder

/**
 * POST /api/tenants
 * Body: { companyName, address, contactEmail, contactPhone, adminName, gstn }
 */
exports.createTenant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* 1 ── Extract payload */
    const {
      companyName,
      address,
      contactEmail,
      contactPhone,
      adminName,
      gstn,
    } = req.body;

    /* 2 ── Prevent duplicate tenant by contactEmail */
    const exists = await Tenant.findOne({ contactEmail }).session(session);
    if (exists) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Tenant with this email already exists" });
    }

    /* 3 ── Create tenant (UUID tenantId) */
    const tenantId = uuidv4();

    const tenant = await Tenant.create(
      [
        {
          tenantId,
          companyName,
          address,
          contactEmail,
          contactPhone,
          gstn,
        },
      ],
      { session }
    ).then((docs) => docs[0]); // create() + session returns an array

    /* 4 ── Seed default roles INSIDE this transaction */
    await seedRolesForTenant(tenantId, session);      // <- single call, passes session

    /* 5 ── Get the freshly-seeded Admin role */
    const adminRole = await Role.findOne({
      tenantId,
      slug: "admin",
    }).session(session);

    if (!adminRole) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ error: "Admin role not found after seeding" });
    }

    /* 6 ── Create first admin user linked to Admin role */
    const defaultPassword = "Welcome@2025";
    const hashedPassword  = await bcrypt.hash(defaultPassword, 10);

    await User.create(
      [
        {
          userId: uuidv4(),
          name: adminName,
          email: contactEmail,
          password: hashedPassword,
          role: adminRole._id,   // ObjectId reference
          tenantId,              // UUID
          phoneNumber: contactPhone,
          firstLogin: true,
        },
      ],
      { session }
    );

    /* 7 ── Commit transaction */
    await session.commitTransaction();
    session.endSession();

    /* 8 ── Respond */
    return res.status(201).json({
      message: "Tenant and admin user created successfully",
      tenant,
      adminCredentials: {
        email:    contactEmail,
        password: defaultPassword, // show only once
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating tenant:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
