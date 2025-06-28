// utils/seedRolesForTenant.js
const Role = require("../models/role");
const generateSlug = require("./generateSlug");

const defaults = [
  { name: "Admin", permissions: ["*"] },
  { name: "HR", permissions: ["create_employee", "view_employee"] },
  { name: "Manager", permissions: ["view_team", "approve_leave"] },
  { name: "Employee", permissions: ["view_profile", "apply_leave"] },
];

async function seedRolesForTenant(tenantId, session = null) {
  const existing = await Role.find({ tenantId })
    .select("slug")
    .session(session)
    .lean();

  const existingSlugs = new Set(existing.map((r) => r.slug));

  const rolesToInsert = defaults
    .filter((role) => !existingSlugs.has(generateSlug(role.name)))
    .map((role) => ({
      ...role,
      tenantId,
      slug: generateSlug(role.name),
    }));

  if (rolesToInsert.length > 0) {
    await Role.insertMany(rolesToInsert, { session, ordered: false });
  }
}

module.exports = seedRolesForTenant;
