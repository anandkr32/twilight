const Tenant = require('../models/tenant');
exports.createTenant = async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    res.status(201).json(tenant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.createTenant = async (req, res) => {
  try {
    const {
      companyName,
      address,
      contactEmail,
      contactPhone,
      adminName,
      adminEmail
    } = req.body;

    const tenantId = uuidv4(); // Unique tenant ID
    const defaultPassword = "Welcome@2025";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Step 1: Create Tenant
    const tenant = new Tenant({
      tenantId,
      companyName,
      address,
      contactEmail,
      contactPhone,
    });

    await tenant.save();

    // Step 2: Create Admin User
    const adminUser = new User({
      userId: uuidv4(),
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      accessLevel: "admin", // optional field
      tenantId: tenantId,
      firstLogin: true,
    });

    await adminUser.save();

    res.status(201).json({
      message: "Tenant and default admin created successfully",
      tenant,
      adminCredentials: {
        email: adminEmail,
        password: defaultPassword,
      },
    });
  } catch (err) {
    console.error("Error creating tenant and admin:", err);
    res.status(400).json({ error: err.message });
  }
};
