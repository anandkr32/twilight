const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  tenantId: {type: String, required: true, }, // unique tenant identifier
  name: { type: String, required: true }, // "Admin", "HR", ...
  slug: { type: String, required: true, lowercase: true },
  permissions: [String], // ["create_employee", "view_salary"]
  createdAt: { type: Date, default: Date.now },
});

// each tenant can re-use the same slug names
roleSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
