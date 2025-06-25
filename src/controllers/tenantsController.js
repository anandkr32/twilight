const Tenant = require("../models/tenant");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

exports.createTenant = async (req, res) => {
  try {
    const {
      companyName,
      address,
      contactEmail,
      contactPhone,
      adminName,
      gstn,
    } = req.body;

    // Step 1: Check if tenant already exists
    const alreadyExists = await Tenant.findOne({ contactEmail }); // <-- missing await in your version
    if (alreadyExists) {
      return res
        .status(400)
        .json({ error: "Tenant with this email already exists" });
    }

    const tenantId = uuidv4();
    const defaultPassword = "Welcome@2025";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Step 2: Create Tenant
    const tenant = new Tenant({
      tenantId,
      companyName,
      address,
      contactEmail,
      contactPhone,
      gstn,
    });

    await tenant.save();

    // Step 3: Create Admin User
    const adminUser = new User({
      userId: uuidv4(),
      name: adminName,
      email: contactEmail,
      password: hashedPassword,
      accessLevel: "admin",
      tenantId: tenantId,
      firstLogin: true,
      phoneNumber: contactPhone, // spelling corrected
    });

    await adminUser.save();

    // Step 4: Respond
    res.status(201).json({
      message: "Tenant and admin user created successfully",
      tenant,
      adminCredentials: {
        email: contactEmail,
        password: defaultPassword, // return plaintext here only once
      },
    });
  } catch (err) {
    console.error("Error creating tenant:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
